import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { FindProductDto } from './dto/find-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { IdValidationPipe } from '../pipes/id-validation.pipe';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('product')
@UsePipes(new ValidationPipe())
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async create(@Body() dto: CreateProductDto) {
        return this.productService.create(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async get(@Param('id', IdValidationPipe) id: string) {
        return this.productService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async patch(@Param('id', IdValidationPipe) id: string, @Body() dto: CreateProductDto) {
        return this.productService.updateById(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id', IdValidationPipe) id: string) {
        return this.productService.deleteById(id);
    }

    @HttpCode(200)
    @Post('find')
    async find(@Body() dto: FindProductDto) {
        return this.productService.findWithReviews(dto);
    }
}
