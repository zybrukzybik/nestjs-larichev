import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { getModelToken } from 'nestjs-typegoose';
import { UserModel } from '../src/user/user.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { USER_ALREADY_REGISTERED_ERROR, USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from '../src/auth/auth.constants';

const testAuthDto: AuthDto = {
    login: 'some@gmail.com',
    password: '12345678',
};

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let createdId: string;
    let userModel: ModelType<UserModel>;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        userModel = app.get(getModelToken(UserModel.name));

        await app.init();

        await userModel.deleteMany();
    });

    afterAll(async () => {
        await userModel.deleteMany();
        await disconnect();
    });

    it('/auth/register (POST) - success', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send(testAuthDto)
            .expect(201)
            .then((res) => {
                createdId = res.body._id;
                expect(createdId).toBeDefined();
            });
    });

    it('/auth/register (POST) - fail USER_EXISTS', () => {
        return request(app.getHttpServer()).post('/auth/register').send(testAuthDto).expect(409, {
            statusCode: 409,
            message: USER_ALREADY_REGISTERED_ERROR,
            error: 'Conflict',
        });
    });

    it('/auth/login (POST) - success', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send(testAuthDto)
            .expect(200)
            .then((res) => {
                expect(res.body.access_token).toBeDefined();
            });
    });

    it('/auth/login (POST) - fail WRONG_LOGIN', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ ...testAuthDto, login: 'wrong@gmail.com' })
            .expect(401, {
                statusCode: 401,
                message: USER_NOT_FOUND_ERROR,
                error: 'Unauthorized',
            });
    });

    it('/auth/login (POST) - fail WRONG_PASSWORD', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ ...testAuthDto, password: 'wrong_password' })
            .expect(401, {
                statusCode: 401,
                message: WRONG_PASSWORD_ERROR,
                error: 'Unauthorized',
            });
    });
});
