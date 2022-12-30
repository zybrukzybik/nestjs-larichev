import { InjectModel } from 'nestjs-typegoose';
import { UserModel } from './user.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository {
    constructor(@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>) {}

    async createUser(email: string, passwordHash: string) {
        const newUser = new this.userModel();

        newUser.email = email;
        newUser.passwordHash = passwordHash;

        return newUser.save();
    }

    async findUserByEmail(email: string) {
        return this.userModel.findOne({ email }).exec();
    }
}
