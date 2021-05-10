import { IsEmail, IsNotEmpty } from "class-validator";

export default class LoginDto {
    constructor(
        email: string,
        password: string
    )
    {
        this.email = email;
        this.password = password;
    }
    @IsNotEmpty()
    @IsEmail()
    public email: string;
    @IsNotEmpty()
    public password: string;
}