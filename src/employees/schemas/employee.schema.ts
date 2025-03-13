import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Department } from '../../departments/schemas/department.schema';

export type EmployeeDocument = HydratedDocument<Employee>;

@Schema()
export class Employee {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  position: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
  departmentId: Department;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
