import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';

@Injectable()
export class EmployeesService {
  constructor(@InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>) {}

  
  async create(data: { name: string; position: string; departmentId: string }): Promise<Employee> {
    const createdEmployee = new this.employeeModel(data);
    return createdEmployee.save();
  }

  
  async findAll(): Promise<Employee[]> {
    return this.employeeModel.find().populate('departmentId').exec();
  }

  
  async update(id: string, data: { name?: string; position?: string; departmentId?: string }): Promise<Employee | null> {
    return this.employeeModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  
  async delete(id: string): Promise<Employee | null> {
    return this.employeeModel.findByIdAndDelete(id).exec();
  }
}
