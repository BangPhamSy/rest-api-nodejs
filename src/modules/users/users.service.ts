import { HttpException } from "@core/exceptions";
import IUser from "./users.interface";
import UserSchema from "./users.model";
import { DataStoredInToken, TokenData } from "@modules/auth";
import RegisterDto from "./dtos/register.dto";
import { generateJwtToken, isEmptyObject, randomTokenString } from "@core/utils/helpers";
import gravatar from "gravatar";
import bcryptjs from "bcryptjs";
import { IPagination } from "@core/interfaces";
import { RefreshTokenSchema } from "@modules/refresh_token";

class UserService {
  public userSchema = UserSchema;

  public async createUser(model: RegisterDto): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }
    const user = await this.userSchema.findOne({ email: model.email });
    if (user) {
      throw new HttpException(409, `Your email ${model.email} already exist.`);
    }
    const avatar = gravatar.url(model.email!, {
      size: "200",
      rating: "g",
      default: "mm",
    });
    const salt = await bcryptjs.genSalt(10);

    const hashedPassword = await bcryptjs.hash(model.password!, salt);
    const createdUser: IUser = await this.userSchema.create({
      ...model,
      password: hashedPassword,
      avatar: avatar,
      date: Date.now(),
    });
    const refreshToken = await this.generateRefreshToken(createdUser._id);
    await refreshToken.save();

    return generateJwtToken(createdUser._id, refreshToken.token);
  }

  public async updateUser(userId: string, model: RegisterDto): Promise<IUser> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is not empty");
    }

    const user = await this.userSchema.findById(userId).exec();

    if (!user) {
      throw new HttpException(404, `User not is exist.`);
    }

    let avatar = user.avatar;

    const checkEmailExist = await this.userSchema
      .find({
        $and: [{ email: { $eq: model.email } }, { _id: { $ne: userId } }],
      })
      .exec();
    if (checkEmailExist.length !== 0) {
      throw new HttpException(400, 'Your email has been used by another user');
    }

    avatar = gravatar.url(model.email!, {
      size: '200',
      rating: 'g',
      default: 'mm',
    });


    let updateUserById;

    if (user.password) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(model.password, salt);
      updateUserById = await this.userSchema
        .findByIdAndUpdate(userId, {
          ...model,
          avatar: avatar,
          password: hashedPassword,
        })
        .exec();
    } else {
      updateUserById = await this.userSchema
        .findByIdAndUpdate(userId, {
          ...model,
          avatar: avatar,
        })
        .exec();
    }

    if (!updateUserById) throw new HttpException(409, "You are not an user");
    return updateUserById;
  }

  public async getUserById(userId: string): Promise<IUser> {
    const user = await this.userSchema.findById(userId).exec();
    if (!user) {
      throw new HttpException(404, `User is not exists`);
    }
    return user;
  }

  public async getAll(): Promise<IUser[]> {
    const users = await this.userSchema.find().exec();
    return users;
  }

  public async getAllPaging(
    keyword: string,
    page: number
  ): Promise<IPagination<IUser>> {
    const pageSize: number = Number(process.env.PAGE_SIZE || 10);
    let query = {};
    if (keyword) {
      query = {
        $or: [
          { email: keyword },
          { first_name: keyword },
          { last_name: keyword },
        ],
      };
    }
    const users = await this.userSchema
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
    const rowCount = await this.userSchema.find(query).countDocuments().exec();
    return {
      total: rowCount,
      page: page,
      pageSize: pageSize,
      items: users,
    } as IPagination<IUser>;
  }

  public async deleteUser(userId: string): Promise<IUser> {
    const deleteUser = await this.userSchema.findByIdAndDelete(userId);
    if (!deleteUser) {
      throw new HttpException(400, "User not is exist");
    }
    return deleteUser;
  }
  private generateRefreshToken(userId: string) {
    // create a refresh token that expires in 7 days
    return new RefreshTokenSchema({
      user: userId,
      token: randomTokenString(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }
}
export default UserService;
