import { HttpException } from '@core/exceptions';
import { isEmptyObject, Logger } from '@core/utils';
import IUser from '@modules/users/users.interface';
import LoginDto from './auth.dto';
import { UserSchema } from '@modules/users';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DataStoredInToken, TokenData } from './auth.interface';
import { RefreshTokenSchema } from '@modules/refresh_token';
import { generateJwtToken, randomTokenString } from '@core/utils/helpers';

class AuthService {
  public userSchema = UserSchema;

  public async login(model: LoginDto): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, 'Model is empty');
    }

    const user = await this.userSchema.findOne({ email: model.email });

    if (!user) throw new HttpException(409, `Your email ${model.email} is not exist.`);
    const isMatchingPassword = await bcryptjs.compare(model.password, user.password);
    if (!isMatchingPassword) throw new HttpException(400, `Credential is not valid`);
    const refreshToken = await this.generateRefreshToken(user._id);
    const jwtToken = generateJwtToken(user._id, refreshToken.token);

    // save refresh token
    await refreshToken.save();

    return jwtToken;
  }

  public async refreshToken(token: string): Promise<TokenData> {
    const refreshToken = await this.getRefreshTokenFromDb(token);
    const { user } = refreshToken;

    // replace old refresh token with a new one and save
    const newRefreshToken = await this.generateRefreshToken(user);
    refreshToken.revoked = new Date(Date.now());
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save()

    // return basic details and tokens
    return generateJwtToken(user, newRefreshToken.token);

  }

  public async revokeToken(token: string): Promise<void> {
    const refreshToken = await this.getRefreshTokenFromDb(token);

    // revoke token and save
    refreshToken.revoked = new Date(Date.now());
    await refreshToken.save();
  }

  public async getCurrentLoginUser(userId: string): Promise<IUser> {
    const user = await this.userSchema.findById(userId);
    if (!user) {
      throw new HttpException(404, `User is not exists`);
    }
    return user;
  }

  private generateRefreshToken(userId: string) {
    // create a refresh token that expires in 7 days
    return new RefreshTokenSchema({
      user: userId,
      token: randomTokenString(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 7 days
    });
  }
  private async getRefreshTokenFromDb(refreshToken: string) {
    const token = await RefreshTokenSchema.findOne({ token: refreshToken }).populate('user').exec();
    Logger.info(token);
    if (!token || !token.isActive) throw new HttpException(400, `Invalid refresh token`);
    return token;
  }
}
export default AuthService;
