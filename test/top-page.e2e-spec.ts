import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { disconnect, Types } from 'mongoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { getModelToken } from 'nestjs-typegoose';
import { ProductModel } from '../src/product/product.model';
import { TopLevelCategory, TopPageModel } from '../src/top-page/top-page.model';
import { CreateTopPageDto } from '../src/top-page/dto/create-top-page.dto';
import { TOP_PAGE_NOT_FOUND_ERROR } from '../src/top-page/top-page.constants';
import { INVALID_ID_ERROR } from '../src/pipes/id-validation.constants';
import { FindTopPageDto } from '../src/top-page/dto/find-top-page.dto';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { UserModel } from '../src/user/user.model';

const alias = 'Alias';

const testTopPageDto: CreateTopPageDto = {
    firstCategory: TopLevelCategory.Courses,
    secondCategory: 'Bibi',
    alias,
    title: 'Title typescript',
    category: 'Category',
    hh: {
        count: 1,
        juniorSalary: 1000,
        middleSalary: 2000,
        seniorSalary: 3000,
    },
    advantages: [
        { title: 'Cool', description: 'Some cool' },
        { title: 'Warm', description: 'Some warm' },
    ],
    seoText: 'SEO write javascript',
    tagsTitle: 'Tag title',
    tags: ['buy', 'high', 'cheap'],
};

const testFindTopPageDto: FindTopPageDto = {
    firstCategory: TopLevelCategory.Courses,
};

const testAuthDto: AuthDto = {
    login: 'some@gmail.com',
    password: '12345678',
};

describe('TopPageController (e2e)', () => {
    let app: INestApplication;
    let createdId: Types.ObjectId;
    let topPageModel: ModelType<ProductModel>;
    let userModel: ModelType<UserModel>;
    let accessToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        topPageModel = app.get(getModelToken(TopPageModel.name));
        userModel = app.get(getModelToken(UserModel.name));

        await app.init();

        await topPageModel.deleteMany();
        await userModel.deleteMany();

        await request(app.getHttpServer()).post('/auth/register').send(testAuthDto);
        const res = await request(app.getHttpServer()).post('/auth/login').send(testAuthDto);
        accessToken = res.body.access_token;
    });

    afterAll(async () => {
        await topPageModel.deleteMany();
        await userModel.deleteMany();
        await disconnect();
    });

    describe('/top-page/create (POST)', () => {
        //
        it('/top-page/create (POST) - success', () => {
            return request(app.getHttpServer())
                .post('/top-page/create')
                .set('Authorization', 'Bearer ' + accessToken)
                .send(testTopPageDto)
                .expect(201)
                .then((res) => {
                    createdId = res.body._id;
                    expect(createdId).toBeDefined();
                });
        });

        it('/top-page/create (POST) - fail WRONG DATA', () => {
            return request(app.getHttpServer())
                .post('/top-page/create')
                .set('Authorization', 'Bearer ' + accessToken)
                .send({ ...testTopPageDto, category: 1 })
                .expect(400);
        });
    });

    describe('/top-page/:id (GET)', () => {
        //
        it('/top-page/:id (GET) - success', () => {
            return request(app.getHttpServer())
                .get('/top-page/' + createdId)
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(200)
                .then((res) => {
                    expect(res.body._id).toBeDefined();
                });
        });

        it('/top-page/:id (GET) - fail WRONG ID', () => {
            const randomId = new Types.ObjectId().toHexString();

            return request(app.getHttpServer())
                .get('/top-page/' + randomId)
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(404)
                .expect({
                    statusCode: 404,
                    message: TOP_PAGE_NOT_FOUND_ERROR,
                    error: 'Not Found',
                });
        });

        it('/top-page/:id (GET) - fail INVALID ID', () => {
            return request(app.getHttpServer())
                .get('/top-page/' + 'bullshitId')
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(400)
                .expect({
                    statusCode: 400,
                    message: INVALID_ID_ERROR,
                    error: 'Bad Request',
                });
        });
    });

    describe('/top-page/byAlias/:alias (GET)', () => {
        //
        it('/top-page/byAlias/:alias (GET) - success', () => {
            return request(app.getHttpServer())
                .get('/top-page/byAlias/' + alias)
                .expect(200)
                .then((res) => {
                    expect(res.body._id).toBeDefined();
                });
        });

        it('/top-page/byAlias/:alias (GET) - fail WRONG ALIAS', () => {
            return request(app.getHttpServer())
                .get('/top-page/byAlias/' + 'wrongAlias')
                .expect(404)
                .expect({
                    statusCode: 404,
                    message: TOP_PAGE_NOT_FOUND_ERROR,
                    error: 'Not Found',
                });
        });
    });

    describe('/top-page/find (POST)', () => {
        //
        it('/top-page/find (POST) - success', () => {
            return request(app.getHttpServer())
                .post('/top-page/find')
                .send(testFindTopPageDto)
                .expect(200)
                .then((res) => {
                    console.log(res.body[0]);
                    expect(res.body).toHaveLength(1);
                    expect(res.body[0]._id).toBeDefined();
                    expect(res.body[0].pages).toBeDefined();
                    expect(res.body[0].pages[0].alias).toBeDefined();
                    expect(res.body[0].pages[0].title).toBeDefined();
                });
        });

        it('/top-page/find (POST) - fail NOT EXISTS FIRST_CATEGORY', () => {
            return request(app.getHttpServer())
                .post('/top-page/find')
                .send({ ...testFindTopPageDto, firstCategory: TopLevelCategory.Services })
                .expect(200)
                .then((res) => {
                    expect(res.body).toEqual([]);
                });
        });

        it('/top-page/find (POST) - fail INVALID FIRST_CATEGORY', () => {
            return request(app.getHttpServer())
                .post('/top-page/find')
                .send({ ...testFindTopPageDto, firstCategory: 'Wrong' })
                .expect(400);
        });
    });

    describe('/top-page/textSearch/:text (GET)', () => {
        //
        it('/top-page/textSearch/:text (GET) - success TITLE', () => {
            return request(app.getHttpServer())
                .get('/top-page/textSearch/' + 'typescript')
                .expect(200)
                .then((res) => {
                    expect(res.body).toHaveLength(1);
                    expect(res.body[0].title).toMatch(/typescript/i);
                });
        });

        it('/top-page/textSearch/:text (GET) - success SEO_TEXT', () => {
            return request(app.getHttpServer())
                .get('/top-page/textSearch/' + 'seo')
                .expect(200)
                .then((res) => {
                    expect(res.body).toHaveLength(1);
                    expect(res.body[0].seoText).toMatch(/seo/i);
                });
        });

        it('/top-page/textSearch/:text (GET) - success ADVANTAGES DESCRIPTION', () => {
            return request(app.getHttpServer())
                .get('/top-page/textSearch/' + 'warm')
                .expect(200)
                .then((res) => {
                    expect(res.body).toHaveLength(1);
                    expect(res.body[0].advantages[1].description).toMatch(/warm/i);
                });
        });

        it('/top-page/textSearch/:text (GET) - fail NOT EXISTS TEXT', () => {
            return request(app.getHttpServer())
                .get('/top-page/textSearch/' + 'bullshit')
                .expect(200)
                .then((res) => {
                    expect(res.body).toEqual([]);
                });
        });
    });

    describe('/top-page/:id (PATCH)', () => {
        //
        it('/top-page/:id (PATCH) - success', () => {
            return request(app.getHttpServer())
                .patch('/top-page/' + createdId)
                .set('Authorization', 'Bearer ' + accessToken)
                .send({ ...testTopPageDto, secondCategory: 'Cici' })
                .expect(200)
                .then((res) => {
                    expect(res.body._id).toBeDefined();
                });
        });

        it('/top-page/:id (PATCH) - fail WRONG ID', () => {
            const randomId = new Types.ObjectId().toHexString();

            return request(app.getHttpServer())
                .patch('/top-page/' + randomId)
                .set('Authorization', 'Bearer ' + accessToken)
                .send({ ...testTopPageDto, secondCategory: 'Cici' })
                .expect(404)
                .expect({
                    statusCode: 404,
                    message: TOP_PAGE_NOT_FOUND_ERROR,
                    error: 'Not Found',
                });
        });

        it('/top-page/:id (PATCH) - fail INVALID ID', () => {
            return request(app.getHttpServer())
                .patch('/top-page/' + 'bullshitId')
                .set('Authorization', 'Bearer ' + accessToken)
                .send({ ...testTopPageDto, secondCategory: 'Cici' })
                .expect(400)
                .expect({
                    statusCode: 400,
                    message: INVALID_ID_ERROR,
                    error: 'Bad Request',
                });
        });

        it('/top-page/:id (PATCH) - fail WRONG DTO DATA', () => {
            return request(app.getHttpServer())
                .patch('/top-page/' + createdId)
                .set('Authorization', 'Bearer ' + accessToken)
                .send({ ...testTopPageDto, secondCategory: 1111 })
                .expect(400);
        });
    });

    describe('/top-page/:id (DELETE)', () => {
        //
        it('/top-page/:id (DELETE) - fail RANDOM_ID', () => {
            const randomId = new Types.ObjectId().toHexString();

            return request(app.getHttpServer())
                .delete('/top-page/' + randomId)
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(404)
                .expect({
                    statusCode: 404,
                    message: TOP_PAGE_NOT_FOUND_ERROR,
                    error: 'Not Found',
                });
        });

        it('/top-page/:id (DELETE) - fail INVALID_ID', () => {
            return request(app.getHttpServer())
                .delete('/top-page/' + 'bullshitId')
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(400);
        });

        it('/top-page/:id (DELETE) - success', () => {
            return request(app.getHttpServer())
                .delete('/top-page/' + createdId)
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(200)
                .then((res) => {
                    expect(res.body._id).toBeDefined();
                });
        });
    });
});
