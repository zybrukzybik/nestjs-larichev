import { Injectable } from '@nestjs/common';
import { AuthDto } from '../auth/dto/auth.dto';
import { genSalt, hash } from 'bcryptjs';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(private readonly userRepo: UserRepository) {}

    async createUser(dto: AuthDto) {
        const salt = await genSalt(10);
        const passwordHash = await hash(dto.password, salt);

        return this.userRepo.createUser(dto.login, passwordHash);
    }

    async findUserByEmail(email: string) {
        return this.userRepo.findUserByEmail(email);
    }
}
