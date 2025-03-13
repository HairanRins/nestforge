import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsMongoId()
  @IsNotEmpty()
  departmentId: string;
}
