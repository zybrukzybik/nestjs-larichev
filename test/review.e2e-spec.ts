import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateReviewDto } from '../src/review/dto/create-review.dto';
import { disconnect, Types } from 'mongoose';
import { REVIEW_NOT_FOUND_ERROR, REVIEW_WITH_NAME_ALREADY_EXISTS } from '../src/review/review.contants';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { ReviewModel } from '../src/review/review.model';
import { getModelToken } from 'nestjs-typegoose';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { UserModel } from '../src/user/user.model';
import { INVALID_ID_ERROR } from '../src/pipes/id-validation.constants';

const productId = new Types.ObjectId().toHexString();

const testReviewDto: CreateReviewDto = {
    name: 'Some name',
    description: 'SOme description',
    rating: 5,
    title: 'Some title',
    productId,
};

const testAuthDto: AuthDto = {
    login: 'some@gmail.com',
    password: '12345678',
};

describe('ReviewController (e2e)', () => {
    let app: INestApplication;
    let createdId: Types.ObjectId;
    let reviewModel: ModelType<ReviewModel>;
    let userModel: ModelType<UserModel>;
    let access_token: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        reviewModel = app.get(getModelToken(ReviewModel.name));
        userModel = app.get(getModelToken(UserModel.name));

        await app.init();

        await request(app.getHttpServer()).post('/auth/register/').send(testAuthDto);
        const resLogin = await request(app.getHttpServer()).post('/auth/login/').send(testAuthDto);
        access_token = resLogin.body.access_token;

        await reviewModel.deleteMany();
        await userModel.deleteMany();
    });

    afterAll(async () => {
        await reviewModel.deleteMany();
        await userModel.deleteMany();
        await disconnect();
    });

    it('/review/create (POST) - success', () => {
        return request(app.getHttpServer())
            .post('/review/create')
            .send(testReviewDto)
            .expect(201)
            .then((res) => {
                createdId = res.body._id;
                expect(createdId).toBeDefined();
            });
    });

    it('/review/create (POST) - fail ALREADY_EXISTS', () => {
        return request(app.getHttpServer())
            .post('/review/create')
            .send(testReviewDto)
            .expect(409)
            .expect({ statusCode: 409, message: REVIEW_WITH_NAME_ALREADY_EXISTS, error: 'Conflict' });
    });

    it('/review/create (POST) - fail WRONG_DATA', () => {
        return request(app.getHttpServer())
            .post('/review/create')
            .send({ ...testReviewDto, rating: 0 })
            .expect(400);
    });

    it('/review/byProductId/:productId (GET) - success', () => {
        return request(app.getHttpServer())
            .get('/review/byProductId/' + productId)
            .expect(200)
            .then((res) => {
                expect(res.body.length).toBe(1);
            });
    });

    it('/review/byProductId/:productId (GET) - success EMPTY_ARRAY', () => {
        const randomId = new Types.ObjectId().toHexString();

        return request(app.getHttpServer())
            .get('/review/byProductId/' + randomId)
            .expect(200)
            .then((res) => {
                expect(res.body).toHaveLength(0);
            });
    });

    it('/review/byProductId/:productId (GET) - fail INVALID_ID', () => {
        return request(app.getHttpServer())
            .get('/review/byProductId/' + 'bullshitId')
            .expect(400)
            .expect({
                statusCode: 400,
                message: INVALID_ID_ERROR,
                error: 'Bad Request',
            });
    });

    it('/review/:id (DELETE) - success', () => {
        return request(app.getHttpServer())
            .delete('/review/' + createdId)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(200);
    });

    it('/review/:id (DELETE) - fail WRONG ID', async () => {
        const review = await reviewModel.create(testReviewDto);
        createdId = review._id;

        const randomId = new Types.ObjectId().toHexString();

        return request(app.getHttpServer())
            .delete('/review/' + randomId)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(404)
            .expect({
                statusCode: 404,
                message: REVIEW_NOT_FOUND_ERROR,
            });
    });

    it('/review/:id (DELETE) - fail INVALID ID', async () => {
        return request(app.getHttpServer())
            .delete('/review/' + 'bullshitId')
            .set('Authorization', 'Bearer ' + access_token)
            .expect(400)
            .expect({
                statusCode: 400,
                message: INVALID_ID_ERROR,
                error: 'Bad Request',
            });
    });

    it('/review/:id (DELETE) - fail WRONG ACCESS_TOKEN', () => {
        return request(app.getHttpServer())
            .delete('/review/' + createdId)
            .set('Authorization', 'Bearer ' + 'fake' + access_token)
            .expect(401);
    });

    it('/byProductId/:productId (DELETE) - success', () => {
        return request(app.getHttpServer())
            .delete('/review/byProductId/' + productId)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(200);
    });

    it('/byProductId/:productId (DELETE) - fail WRONG PRODUCT ID', async () => {
        await reviewModel.create(testReviewDto);

        const randomProductId = new Types.ObjectId().toHexString();

        return request(app.getHttpServer())
            .delete('/review/byProductId/' + randomProductId)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(404, {
                statusCode: 404,
                message: REVIEW_NOT_FOUND_ERROR,
            });
    });

    it('/byProductId/:productId (DELETE) - fail INVALID PRODUCT ID', async () => {
        return request(app.getHttpServer())
            .delete('/review/byProductId/' + 'bullshitId')
            .set('Authorization', 'Bearer ' + access_token)
            .expect(400)
            .expect({
                statusCode: 400,
                message: INVALID_ID_ERROR,
                error: 'Bad Request',
            });
    });

    it('/byProductId/:productId (DELETE) - fail WRONG ACCESS_TOKEN', () => {
        return request(app.getHttpServer())
            .delete('/review/byProductId/' + productId)
            .set('Authorization', 'Bearer ' + 'fake' + access_token)
            .expect(401);
    });
});
