import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';
import { REVIEW_NOT_FOUND_ERROR } from './review.contants';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { IdValidationPipe } from '../pipes/id-validation.pipe';

@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @UsePipes(new ValidationPipe())
    @Post('create')
    async create(@Body() dto: CreateReviewDto) {
        return this.reviewService.create(dto);
    }

    @Get('byProductId/:productId')
    async getByProductId(@Param('productId', IdValidationPipe) productId: string) {
        return this.reviewService.findByProductId(productId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id', IdValidationPipe) id: string) {
        const deletedDoc = await this.reviewService.delete(id);

        if (!deletedDoc) {
            throw new HttpException(REVIEW_NOT_FOUND_ERROR, HttpStatus.NOT_FOUND);
        } else {
            return deletedDoc;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete('byProductId/:productId')
    async deleteByProductId(@Param('productId', IdValidationPipe) productId: string) {
        const deletedDocs = await this.reviewService.deleteByProductId(productId);

        if (deletedDocs.deletedCount === 0) {
            throw new HttpException(REVIEW_NOT_FOUND_ERROR, HttpStatus.NOT_FOUND);
        } else {
            return { deletedCount: deletedDocs.deletedCount };
        }
    }
}
