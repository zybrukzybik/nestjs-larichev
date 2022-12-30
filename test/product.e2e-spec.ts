import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect, Types } from 'mongoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { getModelToken } from 'nestjs-typegoose';
import { CreateProductDto } from '../src/product/dto/create-product.dto';
import { ProductModel } from '../src/product/product.model';
import { PRODUCT_NOT_FOUND_ERROR } from '../src/product/product.constants';
import { FindProductDto } from '../src/product/dto/find-product.dto';
import { CreateReviewDto } from '../src/review/dto/create-review.dto';
import { ReviewModel } from '../src/review/review.model';
import { randomInt } from 'crypto';
import { INVALID_ID_ERROR } from '../src/pipes/id-validation.constants';
import { UserModel } from '../src/user/user.model';
import { AuthDto } from '../src/auth/dto/auth.dto';

const generateTestProductDto = (num: number, categories: string[]): CreateProductDto => {
    return {
        image: `imageUrl_${num}`,
        title: `Test product ${num}`,
        price: 110,
        oldPrice: 150,
        description: 'Some cool product',
        advantages: 'Power efficient',
        disAdvantages: 'High price',
        categories: categories,
        tags: ['tag1', 'tag2', 'tag3'],
        characteristics: [
            { name: 'CPU speed', description: 'Intel 12th i7' },
            { name: 'RAM', description: '128 GB DDR7 soldered RAM' },
        ],
    };
};

const generateTestReviewDto = (num: number, rating: number, productId: Types.ObjectId): CreateReviewDto => {
    return {
        name: `Review ${num} name`,
        title: `Review ${num} title`,
        description: `Review ${num} description`,
        rating,
        productId: String(productId),
    };
};

const testCategory1 = 'Laptop';

const testFindProductDto: FindProductDto = {
    category: testCategory1,
    limit: 10,
};

const testAuthDto: AuthDto = {
    login: 'some@gmail.com',
    password: '12345678',
};

describe('ProductController (e2e)', () => {
    let app: INestApplication;
    let createdId: Types.ObjectId;
    let productModel: ModelType<ProductModel>;
    let reviewModel: ModelType<ReviewModel>;
    let userModel: ModelType<UserModel>;
    let accessToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        productModel = app.get(getModelToken(ProductModel.name));
        reviewModel = app.get(getModelToken(ReviewModel.name));
        userModel = app.get(getModelToken(UserModel.name));

        await app.init();

        await productModel.deleteMany();
        await reviewModel.deleteMany();
        await userModel.deleteMany();

        await request(app.getHttpServer()).post('/auth/register').send(testAuthDto);
        const res = await request(app.getHttpServer()).post('/auth/login').send(testAuthDto);
        accessToken = res.body.access_token;
    });

    afterAll(async () => {
        await productModel.deleteMany();
        await reviewModel.deleteMany();
        await userModel.deleteMany();

        await disconnect();
    });

    describe('/product/create (POST)', () => {
        //
        it('/product/create (POST) - success', () => {
            return request(app.getHttpServer())
                .post('/product/create')
                .set('Authorization', 'Bearer ' + accessToken)
                .send(generateTestProductDto(1, [testCategory1]))
                .expect(201)
                .then((res) => {
                    createdId = res.body._id;
                    expect(createdId).toBeDefined();
                });
        });

        it('/product/create (POST) - fail WRONG_IMAGE', () => {
            return request(app.getHttpServer())
                .post('/product/create')
                .set('Authorization', 'Bearer ' + accessToken)
                .send({ ...generateTestProductDto(1, [testCategory1]), image: 123 })
                .expect(400);
        });
    });

    describe('/product/:id (GET)', () => {
        //
        it('/product/:id (GET) - success', () => {
            return request(app.getHttpServer())
                .get('/product/' + createdId)
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(200)
                .then((res) => {
                    expect(res.body._id).toBe(createdId);
                });
        });

        it('/product/:id (GET) - fail WRONG_ID', () => {
            const randomId = new Types.ObjectId().toHexString();

            return request(app.getHttpServer())
                .get('/product/' + randomId)
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(404)
                .expect({
                    statusCode: 404,
                    message: PRODUCT_NOT_FOUND_ERROR,
                    error: 'Not Found',
                });
        });

        it('/product/:id (GET) - fail INVALID_ID', () => {
            return request(app.getHttpServer())
                .get('/product/' + 'bullshitId')
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(400)
                .expect({
                    statusCode: 400,
                    message: INVALID_ID_ERROR,
                    error: 'Bad Request',
                });
        });
    });

    describe('/product/:id (PATCH)', () => {
        //
        it('/product/:id (PATCH) - success', () => {
            const updatedPrice = 100;

            return request(app.getHttpServer())
                .patch('/product/' + createdId)
                .set('Authorization', 'Bearer ' + accessToken)
                .send({ ...generateTestProductDto(1, [testCategory1]), price: updatedPrice })
                .expect(200)
                .then((res) => {
                    expect(res.body.price).toBe(updatedPrice);
                });
        });

        it('/product/:id (PATCH) - fail WRONG_ID', () => {
            const randomId = new Types.ObjectId().toHexString();
            const updatedPrice = 105;

            return request(app.getHttpServer())
                .patch('/product/' + randomId)
                .set('Authorization', 'Bearer ' + accessToken)
                .send({ ...generateTestProductDto(1, [testCategory1]), price: updatedPrice })
                .expect(404)
                .expect({
                    statusCode: 404,
                    message: PRODUCT_NOT_FOUND_ERROR,
                    error: 'Not Found',
                });
        });

        it('/product/:id (PATCH) - fail INVALID_ID', () => {
            const updatedPrice = 105;

            return request(app.getHttpServer())
                .patch('/product/' + 'bullshitId')
                .set('Authorization', 'Bearer ' + accessToken)
                .send({ ...generateTestProductDto(1, [testCategory1]), price: updatedPrice })
                .expect(400)
                .expect({
                    statusCode: 400,
                    message: INVALID_ID_ERROR,
                    error: 'Bad Request',
                });
        });

        it('/product/:id (PATCH) - fail PRICE_TYPE', () => {
            const randomId = new Types.ObjectId().toHexString();
            const updatedPrice = 'wrongPrice';

            return request(app.getHttpServer())
                .patch('/product/' + randomId)
                .set('Authorization', 'Bearer ' + accessToken)
                .send({ ...generateTestProductDto(1, [testCategory1]), price: updatedPrice })
                .expect(400);
        });
    });

    describe('/product/find (POST)', () => {
        //
        it('/product/find (POST) - success', async () => {
            const productCount = 20;
            const ratingArr: number[] = [];

            const calculateAvgRating = (arr: number[]): number => arr.reduce((a, b) => a + b) / arr.length;

            for (let i = 1; i <= productCount; i++) {
                const curRating = randomInt(1, 5);
                ratingArr.push(curRating);

                await reviewModel.create(generateTestReviewDto(i, curRating, createdId));
            }

            return request(app.getHttpServer())
                .post('/product/find')
                .send(testFindProductDto)
                .expect(200)
                .then((res) => {
                    const reviewCount = res.body[0].reviewCount;
                    const reviewAvg = res.body[0].reviewAvg;

                    expect(reviewCount).toBe(productCount);
                    expect(reviewAvg).toBe(calculateAvgRating(ratingArr));
                });
        });

        it('/product/find (POST) - fail WRONG_CATEGORY', () => {
            return request(app.getHttpServer())
                .post('/product/find')
                .send({ ...testFindProductDto, category: 'wrong category' })
                .expect(200)
                .expect([]);
        });

        it('/product/find (POST) - fail NO_CATEGORY', () => {
            return request(app.getHttpServer()).post('/product/find').send({ limit: testFindProductDto.limit }).expect(400);
        });

        it('/product/find (POST) - fail NO_LIMIT', () => {
            return request(app.getHttpServer()).post('/product/find').send({ category: testFindProductDto.category }).expect(400);
        });
    });

    describe('/product/:id (DELETE)', () => {
        it('/product/:id (DELETE) - fail WRONG_ID', () => {
            const randomId = new Types.ObjectId().toHexString();

            return request(app.getHttpServer())
                .delete('/product/' + randomId)
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(404)
                .expect({
                    statusCode: 404,
                    message: PRODUCT_NOT_FOUND_ERROR,
                    error: 'Not Found',
                });
        });

        it('/product/:id (DELETE) - fail INVALID_ID', () => {
            return request(app.getHttpServer())
                .delete('/product/' + 'bullshitId')
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(400)
                .expect({
                    statusCode: 400,
                    message: INVALID_ID_ERROR,
                    error: 'Bad Request',
                });
        });

        it('/product/:id (DELETE) - success', () => {
            return request(app.getHttpServer())
                .delete('/product/' + createdId)
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(200)
                .then(async () => {
                    const product = await productModel.findById(createdId);
                    expect(product).toBeNull();
                });
        });
    });
});
