import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from './schema/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.create(userData);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer la liste des utilisateurs' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs',
    schema: {
      example: [
        {
          id: '681a0b055cb51fbdd728520f',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        {
          id: '681a0c089906df218996667b',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com'
        }
      ]
    }
  })
  async findAll(@Request() req) {
    // Exclure l'utilisateur actuel de la liste
    return this.userService.findAllExcept(req.user.sub);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<User | null> {
    return this.userService.findById(id);
  }
}
