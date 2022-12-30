import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { INVALID_ID_ERROR } from './id-validation.constants';

@Injectable()
export class IdValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any {
        if (metadata.type != 'param') {
            return;
        }

        if (!Types.ObjectId.isValid(value)) {
            throw new BadRequestException(INVALID_ID_ERROR);
        }

        return value;
    }
}
