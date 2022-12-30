import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopPageDto } from './dto/create-top-page.dto';
import { TopPageRepository } from './top-page.repository';
import { TOP_PAGE_NOT_FOUND_ERROR } from './top-page.constants';
import { TopLevelCategory } from './top-page.model';

@Injectable()
export class TopPageService {
    constructor(private readonly topPageRepository: TopPageRepository) {}

    async create(dto: CreateTopPageDto) {
        return this.topPageRepository.create(dto);
    }

    async findById(id: string) {
        const topPage = await this.topPageRepository.findById(id);

        if (!topPage) {
            throw new NotFoundException(TOP_PAGE_NOT_FOUND_ERROR);
        }

        return topPage;
    }

    async findByAlias(alias: string) {
        const topPage = await this.topPageRepository.findByAlias(alias);

        if (!topPage) {
            throw new NotFoundException(TOP_PAGE_NOT_FOUND_ERROR);
        }

        return topPage;
    }

    async findByFirstCategory(firstCategory: TopLevelCategory) {
        return this.topPageRepository.findByFirstCategory(firstCategory);
    }

    async findByText(text: string) {
        return this.topPageRepository.findByText(text);
    }

    async updateById(id: string, dto: CreateTopPageDto) {
        const updatedTopPage = await this.topPageRepository.updateById(id, dto);

        if (!updatedTopPage) {
            throw new NotFoundException(TOP_PAGE_NOT_FOUND_ERROR);
        }

        return updatedTopPage;
    }

    async deleteById(id: string) {
        const deletedTopPage = await this.topPageRepository.deleteById(id);

        if (!deletedTopPage) {
            throw new NotFoundException(TOP_PAGE_NOT_FOUND_ERROR);
        }

        return deletedTopPage;
    }
}
