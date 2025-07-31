import { PartialType } from '@nestjs/mapped-types';
import { CreateBlockDetailDto } from './create-block-detail.dto';

export class UpdateBlockDetailDto extends PartialType(CreateBlockDetailDto) {}
