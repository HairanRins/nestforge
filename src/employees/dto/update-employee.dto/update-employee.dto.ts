import { IsString, IsMongoId, IsOptional } from 'class-validator';

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsMongoId()
  @IsOptional()
  departmentId?: string;
}
