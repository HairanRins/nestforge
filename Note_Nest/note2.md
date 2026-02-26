### **Bases et Fondamentaux de NestJS en TypeScript**

NestJS est un framework Node.js basé sur TypeScript qui facilite la construction d’applications backend modulaires, testables et extensibles en suivant l'architecture **MVC** et les principes de **SOLID**.

---

## 🔹 **1. Installation et Configuration**

### **Installation**

```sh
npm i -g @nestjs/cli
nest new my-app
cd my-app
npm run start:dev
```

### **Structure d’un Projet NestJS**

Un projet NestJS suit une structure modulaire :

```
/src
  ├── app.module.ts  // Module racine
  ├── app.controller.ts // Contrôleur principal
  ├── app.service.ts  // Service principal
  ├── main.ts  // Fichier d’entrée
```

### **Bootstrap de l’Application**

Le fichier `main.ts` démarre l’application avec `NestFactory` :

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

---

## 🔹 **2. Modules, Contrôleurs, Services et Providers**

### **Modules**

Un module regroupe les fonctionnalités associées :

```ts
import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

### **Contrôleurs**

Les contrôleurs gèrent les requêtes HTTP :

```ts
import { Controller, Get } from "@nestjs/common";

@Controller("users")
export class UsersController {
  @Get()
  findAll() {
    return ["user1", "user2"];
  }
}
```

### **Services**

Les services contiennent la logique métier :

```ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  private users = ["user1", "user2"];

  findAll() {
    return this.users;
  }
}
```

### **Injection de Dépendance**

Les services sont injectés dans les contrôleurs :

```ts
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

---

## 🔹 **3. Gestion des Requêtes HTTP**

### **Paramètres et Query Params**

```ts
@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(@Param("id") id: string) {
    return `User ${id}`;
  }

  @Get()
  findByQuery(@Query("name") name: string) {
    return `User with name ${name}`;
  }
}
```

### **Gestion des Requêtes POST**

```ts
@Controller("users")
export class UsersController {
  @Post()
  create(@Body() createUserDto: { name: string }) {
    return `User ${createUserDto.name} created`;
  }
}
```

---

## 🔹 **4. Middleware, Guards et Pipes**

### **Middleware**

```ts
import { Injectable, NestMiddleware } from "@nestjs/common";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.log(`Request...`);
    next();
  }
}
```

Puis, dans `app.module.ts` :

```ts
@Module({
  imports: [UsersModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("users");
  }
}
```

### **Guards (Contrôle d’Accès)**

```ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.headers.authorization === "secret-token";
  }
}
```

Usage dans un contrôleur :

```ts
@UseGuards(AuthGuard)
@Get()
findAll() {
  return 'Protected route';
}
```

### **Pipes (Validation et Transformation)**

```ts
import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: string) {
    const val = parseInt(value, 10);
    if (isNaN(val)) throw new BadRequestException("Invalid number");
    return val;
  }
}
```

Utilisation :

```ts
@Get(':id')
findOne(@Param('id', new ParseIntPipe()) id: number) {
  return `User ${id}`;
}
```

---

## 🔹 **5. Base de Données avec TypeORM**

### **Installation**

```sh
npm install @nestjs/typeorm typeorm pg
```

### **Configuration**

Dans `app.module.ts` :

```ts
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "user",
      password: "password",
      database: "test",
      entities: [User],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

### **Création d'une Entité**

```ts
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```

### **Utilisation dans un Service**

```ts
@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findAll(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async create(name: string): Promise<User> {
    const user = this.userRepo.create({ name });
    return await this.userRepo.save(user);
  }
}
```

---

## 🔹 **6. Bonne Pratiques**

✅ **Utiliser des DTOs** pour valider les données entrantes  
✅ **Utiliser des Modules** pour séparer les fonctionnalités  
✅ **Gérer les erreurs avec `HttpException`**  
✅ **Éviter d'exposer les erreurs internes**  
✅ **Utiliser les Guards pour la sécurité**  
✅ **Configurer la validation avec `class-validator`**  
✅ **Séparer les fichiers de configuration**

---

## **Conclusion**

NestJS est puissant, structuré et suit une approche modulaire qui facilite la scalabilité et la maintenance des applications. En appliquant les bonnes pratiques, on s’assure d’un code propre, sécurisé et performant.
