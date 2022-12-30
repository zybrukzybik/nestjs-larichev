import { IsEmail, IsString, Length } from 'class-validator';

export class AuthDto {
    @IsEmail()
    login: string;

    @IsString()
    @Length(8, 24)
    password: string;
}
