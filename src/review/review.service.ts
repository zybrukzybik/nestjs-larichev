import { ConflictException, Injectable } from '@nestjs/common';
import { ReviewModel } from './review.model';
import { InjectModel } from 'nestjs-typegoose';
import { DocumentType, ModelType } from '@typegoose/typegoose/lib/types';
import { CreateReviewDto } from './dto/create-review.dto';
import { REVIEW_WITH_NAME_ALREADY_EXISTS } from './review.contants';

@Injectable()
export class ReviewService {
    constructor(@InjectModel(ReviewModel) private readonly reviewModel: ModelType<ReviewModel>) {}

    async create(dto: CreateReviewDto): Promise<DocumentType<ReviewModel>> {
        const review = await this.findByName(dto.name);

        if (review) {
            throw new ConflictException(REVIEW_WITH_NAME_ALREADY_EXISTS);
        }

        return this.reviewModel.create(dto);
    }

    async findByProductId(productId: string): Promise<DocumentType<ReviewModel>[]> {
        return this.reviewModel.find({ productId }).exec();
    }

    async delete(id: string): Promise<DocumentType<ReviewModel> | null> {
        return this.reviewModel.findByIdAndDelete(id).exec();
    }

    async deleteByProductId(productId: string) {
        return this.reviewModel.deleteMany({ productId }).exec();
    }

    // helpers
    private async findByName(name: string) {
        return this.reviewModel.findOne({ name });
    }
}
