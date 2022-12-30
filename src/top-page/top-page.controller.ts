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
import { FindTopPageDto } from './dto/find-top-page.dto';
import { CreateTopPageDto } from './dto/create-top-page.dto';
import { TopPageService } from './top-page.service';
import { IdValidationPipe } from '../pipes/id-validation.pipe';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@UsePipes(new ValidationPipe())
@Controller('top-page')
export class TopPageController {
    constructor(private readonly topPageService: TopPageService) {}

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async create(@Body() dto: CreateTopPageDto) {
        return this.topPageService.create(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async get(@Param('id', IdValidationPipe) id: string) {
        return this.topPageService.findById(id);
    }

    @Get('byAlias/:alias')
    async getByAlias(@Param('alias') alias: string) {
        return this.topPageService.findByAlias(alias);
    }

    @HttpCode(200)
    @Post('find')
    async find(@Body() dto: FindTopPageDto) {
        return this.topPageService.findByFirstCategory(dto.firstCategory);
    }

    @Get('textSearch/:text')
    async textSearch(@Param('text') text: string) {
        return this.topPageService.findByText(text);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async patch(@Param('id', IdValidationPipe) id: string, @Body() dto: CreateTopPageDto) {
        return this.topPageService.updateById(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id', IdValidationPipe) id: string) {
        return this.topPageService.deleteById(id);
    }
}
