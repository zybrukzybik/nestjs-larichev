import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { UserService } from '../user/user.service';
import { USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from './auth.constants';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

    async login(dto: AuthDto): Promise<{ access_token: string }> {
        const user = await this.validateUser(dto);

        const payload = {
            email: user.email,
        };

        return { access_token: await this.jwtService.signAsync(payload) };
    }

    private async validateUser(dto: AuthDto) {
        const user = await this.userService.findUserByEmail(dto.login);

        if (!user) {
            throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
        }

        const isCorrectPassword = await compare(dto.password, user.passwordHash);

        if (!isCorrectPassword) {
            throw new UnauthorizedException(WRONG_PASSWORD_ERROR);
        }

        return { email: user.email };
    }
}
