import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamMobilisationDto } from './create-team-mobilisation.dto';

export class UpdateTeamMobilisationDto extends PartialType(CreateTeamMobilisationDto) {}
