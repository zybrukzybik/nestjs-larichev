import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { ReviewModule } from './review/review.module';
import { TopPageModule } from './top-page/top-page.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypegooseModule } from 'nestjs-typegoose';
import { getMongoConfig } from './config/mongo.config';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({ cache: true }),
        TypegooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getMongoConfig,
        }),
        ProductModule,
        AuthModule,
        ReviewModule,
        TopPageModule,
        UserModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
