import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';

@Injectable()
export class DepartmentsService {
  constructor(@InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>) {}

  
  async create(data: { name: string }): Promise<Department> {
    const createdDepartment = new this.departmentModel(data);
    return createdDepartment.save();
  }

 
  async findAll(): Promise<Department[]> {
    return this.departmentModel.find().exec();
  }

  
  async update(id: string, data: { name: string }): Promise<Department | null> {
    return this.departmentModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  
  async delete(id: string): Promise<Department | null> {
    return this.departmentModel.findByIdAndDelete(id).exec();
  }

  
  async getTopDepartments() {
    return this.departmentModel.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'departmentId',
          as: 'employees' 
        }
      },
      {
        $project: {
          name: 1, 
          employeeCount: { $size: '$employees' }, 
          employees: { 
            _id: 1,
            name: 1,
            position: 1
          }
        }
      },
      { $sort: { employeeCount: -1 } }, 
      { $limit: 3 } 
    ]);
  }
  
}
