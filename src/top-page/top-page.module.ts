import { Module } from '@nestjs/common';
import { TopPageController } from './top-page.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { TopPageModel } from './top-page.model';
import { TopPageService } from './top-page.service';
import { TopPageRepository } from './top-page.repository';

@Module({
    imports: [
        TypegooseModule.forFeature([
            {
                typegooseClass: TopPageModel,
                schemaOptions: {
                    collection: 'TopPage',
                },
            },
        ]),
    ],
    controllers: [TopPageController],
    providers: [TopPageService, TopPageRepository],
})
export class TopPageModule {}
