# Guide Complet NestJS - Architecture et Concepts Fondamentaux

Ce document consolide et organise les concepts fondamentaux de NestJS pour éviter les redondances et fournir une vue d'ensemble structurée.

---

## **1. Architecture NestJS**

### Architecture Modulaire (Standard)
NestJS utilise une architecture modulaire inspirée d'Angular :

```typescript
// Structure de base
src/
├── app.module.ts          // Module racine
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   └── users.service.ts
└── main.ts              // Point d'entrée
```

**Principes clés :**
- **Modules** : Organisent le code en blocs fonctionnels
- **Contrôleurs** : Gèrent les requêtes HTTP
- **Services** : Contiennent la logique métier
- **Injection de dépendances** : Relie les composants entre eux

---

## **2. Concepts Fondamentaux**

### Modules (`@Module`)
```typescript
@Module({
  imports: [OtherModule],      // Modules dépendants
  controllers: [Controller],   // Contrôleurs du module
  providers: [Service],       // Services du module
  exports: [Service],         // Services exportés
})
export class FeatureModule {}
```

### Contrôleurs (`@Controller`)
```typescript
@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return ['user1', 'user2'];
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `User ${id}`;
  }

  @Post()
  create(@Body() userData: any) {
    return `User ${userData.name} created`;
  }
}
```

### Services (`@Injectable`)
```typescript
@Injectable()
export class UsersService {
  private users = ['user1', 'user2'];

  findAll() {
    return this.users;
  }

  create(userData: any) {
    this.users.push(userData);
    return userData;
  }
}
```

---

## **3. Gestion des Requêtes HTTP**

### Décorateurs HTTP
- `@Get()` - Requêtes GET
- `@Post()` - Requêtes POST  
- `@Put()` - Requêtes PUT
- `@Delete()` - Requêtes DELETE
- `@Patch()` - Requêtes PATCH

### Extraction de Données
```typescript
@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(
    @Param('id') id: string,        // Paramètres d'URL
    @Query('search') search: string,   // Query parameters
    @Headers('authorization') auth: string // Headers HTTP
  ) {
    return { id, search, auth };
  }

  @Post()
  create(@Body() userData: any) {     // Corps de la requête
    return this.usersService.create(userData);
  }
}
```

---

## **4. Sécurité et Validation**

### Guards (`@UseGuards`)
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.headers.authorization === 'valid-token';
  }
}

// Utilisation
@UseGuards(AuthGuard)
@Get('protected')
getProtectedData() {
  return 'Protected data';
}
```

### Pipes (Validation)
```typescript
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value.name) {
      throw new BadRequestException('Name is required');
    }
    return value;
  }
}

// Utilisation
@Post()
create(@Body(ValidationPipe) userData: any) {
  return this.usersService.create(userData);
}
```

---

## **5. Middleware et Interceptors**

### Middleware
```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Request: ${req.method} ${req.url}`);
    next();
  }
}
```

### Interceptors
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    return next.handle().pipe(
      tap(() => console.log('After...'))
    );
  }
}
```

---

## **6. Base de Données**

### TypeORM Integration
```typescript
// app.module.ts
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'nest',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
})
export class AppModule {}
```

### Entité
```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Repository Pattern
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }
}
```

---

## **7. Asynchrone**

### async/await
```typescript
@Injectable()
export class DataService {
  async fetchData(): Promise<string> {
    // Simulation d'appel API/DB
    return new Promise((resolve) => {
      setTimeout(() => resolve('Data fetched'), 1000);
    });
  }
}

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get()
  async getData() {
    try {
      const data = await this.dataService.fetchData();
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
```

### Opérations Parallèles
```typescript
async fetchMultipleData() {
  const [users, products] = await Promise.all([
    this.usersService.findAll(),
    this.productsService.findAll(),
  ]);
  
  return { users, products };
}
```

---

## **8. WebSockets**

### Gateway
```typescript
@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    console.log('Message received:', payload);
    return `Response: ${payload}`;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string): void {
    client.join(room);
    client.emit('joinedRoom', room);
  }
}
```

---

## **9. Bonnes Pratiques**

### DTOs (Data Transfer Objects)
```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;
}
```

### Configuration
```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}

// Utilisation
@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getDatabaseUrl(): string {
    return this.configService.get('DATABASE_URL');
  }
}
```

### Validation Globale
```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  await app.listen(3000);
}
```

---

## **10. Architectures Avancées**

### Clean Architecture
```
src/
├── application/    // Use cases
├── domain/         // Logique métier pure
├── infrastructure/  // Base de données, APIs externes
└── interfaces/      // Contrôleurs, DTOs
```

### Microservices
```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'user_queue',
    },
  });
  
  app.listen();
}
```

---

## **11. Référence Rapide**

### Décorateurs Essentiels
| Décorateur | Usage | Description |
|-------------|-------|-------------|
| `@Module` | `class AppModule {}` | Définit un module |
| `@Controller` | `class UserController {}` | Définit un contrôleur HTTP |
| `@Injectable` | `class UserService {}` | Rend une classe injectable |
| `@Get/@Post` | `method() {}` | Définit une route HTTP |
| `@Body/@Param` | `param: any` | Extrait des données de requête |
| `@UseGuards` | `@Controller()` | Applique des guards |

### Patterns Courants
| Pattern | Description | Exemple |
|--------|-------------|---------|
| Repository | Accès aux données | `@InjectRepository(User)` |
| DTO | Validation des données | `class CreateUserDto {}` |
| Guard | Sécurité | `class AuthGuard {}` |
| Interceptor | Transformation | `class LoggingInterceptor {}` |

---

## **Conclusion**

NestJS combine les meilleures pratiques de :
- **TypeScript** pour la sécurité des types
- **Architecture modulaire** pour l'organisation
- **Injection de dépendances** pour la testabilité
- **Decorators** pour la configuration déclarative
- **Support multi-transport** pour les microservices

Cette approche permet de créer des applications **scalables, maintenables et robustes** adaptées aux besoins modernes.
