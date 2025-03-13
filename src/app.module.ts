import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import * as dotenv from 'dotenv';

dotenv.config(); 

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/employeeDB'), 
    EmployeesModule,
    DepartmentsModule,
  ],
})
export class AppModule {}
