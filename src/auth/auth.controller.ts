import { Body, ConflictException, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { USER_ALREADY_REGISTERED_ERROR } from './auth.constants';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

    @UsePipes(new ValidationPipe())
    @Post('register')
    async register(@Body() dto: AuthDto) {
        const user = await this.userService.findUserByEmail(dto.login);

        if (user) {
            throw new ConflictException(USER_ALREADY_REGISTERED_ERROR);
        }

        return this.userService.createUser(dto);
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Post('login')
    async login(@Body() dto: AuthDto) {
        return this.authService.login(dto);
    }
}
