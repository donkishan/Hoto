import { PartialType } from '@nestjs/mapped-types';
import { CreateSiteReadinessDto } from './create-site-readiness.dto';

export class UpdateSiteReadinessDto extends PartialType(CreateSiteReadinessDto) {}
