# 10 Core Concepts of NestJS

## What is NestJS?
NestJS is a progressive Node.js framework used for building efficient, reliable, and scalable server-side applications. It is built with TypeScript and heavily inspired by Angular, making it a great choice for developers familiar with the Angular ecosystem.

## What Can You Build with NestJS?
- **RESTful APIs** (e.g., user authentication, e-commerce platforms)
- **Microservices** (using different transport layers such as TCP, NATS, MQTT)
- **GraphQL APIs**
- **CLI Tools and Background Tasks**
- **WebSocket Applications**

---

## 1. Application
A NestJS application can be of different types:
- **HTTP Server Application**: Uses `NestFactory.create()` to create APIs and web servers.
- **Microservice Application**: Uses `NestFactory.createMicroservice()` to communicate via internal networks using various transport protocols (e.g., TCP, NATS, MQTT).
- **Standalone Application**: Uses `NestFactory.createApplicationContext()` to run background tasks or CLI tools without a network listener.

Example:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

---

## 2. Modules
Modules are the fundamental building blocks in NestJS. Every application has at least one root module (`AppModule`).
Modules help in organizing code and managing dependencies.

Example:
```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
})
export class AppModule {}
```

**Visual Representation:**
```
AppModule
├── UsersModule
│   ├── UserController
│   ├── UserService
```

---

## 3. Decorators
Decorators are special functions that modify classes, methods, and properties by adding metadata. They play a crucial role in NestJS.

Examples of common decorators:
- `@Module()` - Declares a module.
- `@Controller()` - Declares a controller.
- `@Injectable()` - Declares a service.
- `@Get()` - Handles HTTP GET requests.
- `@Post()` - Handles HTTP POST requests.

Example:
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return 'This will return all users';
  }
}
```

---

## 4. Controllers
Controllers handle incoming requests and send responses. They define route paths and methods that process HTTP requests.

Example:
```typescript
import { Controller, Get, Post } from '@nestjs/common';

@Controller('tasks')
export class TasksController {
  @Get()
  getAllTasks() {
    return 'Return all tasks';
  }

  @Post()
  createTask() {
    return 'Task created';
  }
}
```

---

## 5. Providers
Providers (services, repositories, factories, etc.) handle the business logic and can be injected into controllers and other providers.

Example:
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getUsers() {
    return ['John Doe', 'Jane Doe'];
  }
}
```

---

## 6. Dependency Injection (DI)
NestJS follows Dependency Injection, allowing providers to be injected where needed. This helps in creating loosely coupled components.

Example:
```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }
}
```

---

## 7. Middleware
Middleware functions run before request handlers and can modify requests or responses.

Example:
```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Request... ${req.method} ${req.url}`);
    next();
  }
}
```

---

## 8. Interceptors
Interceptors modify requests or responses, allowing logging, transformation, and error handling.

Example:
```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data => ({ success: true, data })));
  }
}
```

---

## 9. Guards
Guards control access to routes based on conditions like authentication.

Example:
```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.headers.authorization === 'valid-token';
  }
}
```

---

## 10. Pipes
Pipes validate and transform incoming data.

Example:
```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

---

## Conclusion
These 10 core concepts are essential to understanding and building scalable applications in NestJS. 
By leveraging modules, decorators, controllers, providers, and middleware, you can efficiently structure and maintain your applications.

