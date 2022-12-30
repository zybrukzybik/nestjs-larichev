import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { PRODUCT_NOT_FOUND_ERROR } from './product.constants';
import { FindProductDto } from './dto/find-product.dto';

@Injectable()
export class ProductService {
    constructor(private readonly productRepository: ProductRepository) {}

    async create(dto: CreateProductDto) {
        return this.productRepository.create(dto);
    }

    async findById(id: string) {
        const product = await this.productRepository.findById(id);

        if (!product) {
            throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR);
        }

        return product;
    }

    async updateById(id: string, dto: CreateProductDto) {
        const updatedProduct = await this.productRepository.updateById(id, dto);

        if (!updatedProduct) {
            throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR);
        }

        return updatedProduct;
    }

    async deleteById(id: string) {
        const deletedProduct = await this.productRepository.deleteById(id);

        if (!deletedProduct) {
            throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR);
        }
    }

    async findWithReviews(dto: FindProductDto) {
        return this.productRepository.findWithReviews(dto);
    }
}
