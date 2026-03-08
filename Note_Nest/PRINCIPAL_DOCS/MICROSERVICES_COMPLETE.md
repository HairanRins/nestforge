# Guide Complet de Microservices avec NestJS

Ce document consolide tous les concepts de microservices avec NestJS pour éviter les redondances.

---

## **1. Architecture Microservices avec NestJS**

### Principe Fondamental
NestJS supporte nativement les microservices via `@nestjs/microservices` :

```typescript
// Structure microservices
apps/
├── api-gateway/          // Gateway HTTP principal
├── users-service/        // Service utilisateurs
├── orders-service/       // Service commandes
├── payments-service/     // Service paiements
└── notifications-service/ // Service notifications
```

### Types de Transport Supportés
- **TCP** : Communication directe TCP/IP
- **Redis** : Via Redis pub/sub
- **RabbitMQ** : Message broker robuste
- **Kafka** : Streaming distribué
- **MQTT** : IoT et devices légers
- **NATS** : Cloud-native messaging
- **gRPC** : Appels procédures distants

---

## **2. Configuration des Microservices**

### Service TCP Basique
```typescript
// users-service/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 8877,
      },
    },
  );
  
  app.listen();
}
bootstrap();
```

### Service RabbitMQ
```typescript
// notifications-service/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'notifications_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  
  app.listen();
}
bootstrap();
```

---

## **3. Communication Inter-Services**

### Patterns de Communication

#### 1. Request-Response (Synchrones)
```typescript
// Client (dans un autre service)
@Injectable()
export class UsersClient {
  constructor(@Inject('USERS_SERVICE') private client: ClientProxy) {}

  async getUser(id: string): Promise<any> {
    return this.client.send({ cmd: 'get_user' }, id).toPromise();
  }
}

// Server (users-service)
@Controller()
export class UsersController {
  @MessagePattern({ cmd: 'get_user' })
  getUser(data: { id: string }) {
    return { id: data.id, name: 'John Doe', email: 'john@example.com' };
  }
}
```

#### 2. Event-Driven (Asynchrones)
```typescript
// Client (émetteur d'événement)
@Injectable()
export class OrderService {
  constructor(@Inject('NOTIFICATIONS_SERVICE') private client: ClientProxy) {}

  async createOrder(orderData: any) {
    // Logique de création
    const order = await this.saveOrder(orderData);
    
    // Émission d'événement asynchrone
    this.client.emit('order_created', order);
    
    return order;
  }
}

// Server (notifications-service)
@Controller()
export class NotificationsController {
  @EventPattern('order_created')
  handleOrderCreated(order: any) {
    // Envoi d'email/notification
    this.emailService.sendOrderConfirmation(order);
  }
}
```

---

## **4. API Gateway**

### Rôle du Gateway
- Point d'entrée unique pour les clients
- Routage vers les microservices appropriés
- Gestion de l'authentification centralisée

### Implémentation
```typescript
// api-gateway/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();

// api-gateway/app.module.ts
@Module({
  imports: [
    ClientsModule.register([
      { name: 'USERS_SERVICE', transport: Transport.TCP, options: { port: 8877 } },
      { name: 'ORDERS_SERVICE', transport: Transport.TCP, options: { port: 8878 } },
      { name: 'NOTIFICATIONS_SERVICE', transport: Transport.RMQ, options: { urls: ['amqp://localhost:5672'] } },
    ]),
  ],
})
export class AppModule {}
```

### Contrôleur Gateway
```typescript
// api-gateway/user.controller.ts
@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
    @Inject('ORDERS_SERVICE') private ordersClient: ClientProxy,
  ) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    // Délégation au service utilisateurs
    return this.usersClient.send({ cmd: 'get_user' }, id).toPromise();
  }

  @Post(':id/orders')
  async getUserOrders(@Param('id') id: string) {
    // Délégation au service commandes
    return this.ordersClient.send({ cmd: 'get_user_orders' }, id).toPromise();
  }
}
```

---

## **5. Patterns Avancés**

### CQRS avec Microservices
```typescript
// Command Handler
@MessagePattern({ cmd: 'create_user' })
export class CreateUserHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: CreateUserCommand) {
    const user = new User(command.name, command.email);
    return await this.usersRepository.save(user);
  }
}

// Query Handler
@MessagePattern({ cmd: 'get_user' })
export class GetUserHandler {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: GetUserQuery) {
    return await this.usersRepository.findById(query.id);
  }
}
```

### Saga Pattern
```typescript
@Injectable()
export class OrderSaga {
  @Saga()
  orderCreated = (events$: Observable<any>): Observable<void> => {
    return events$.pipe(
      ofType(OrderCreatedEvent),
      mergeMap(event => {
        // Validation du paiement
        return this.httpClient.post('/payments/validate', event.order).pipe(
          map(response => {
            if (response.valid) {
              return new OrderConfirmedEvent(event.order);
            } else {
              return new OrderCancelledEvent(event.order);
            }
          })
        );
      }),
    );
  }
}
```

---

## **6. Configuration et Déploiement**

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    depends_on:
      - users-service
      - orders-service
  
  users-service:
    build: ./users-service
    ports:
      - "8877:8877"
    environment:
      - NODE_ENV=development
  
  orders-service:
    build: ./orders-service
    ports:
      - "8878:8878"
    environment:
      - NODE_ENV=development
  
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
```

### Configuration Environment
```typescript
// config/service.config.ts
export const microserviceConfig = {
  transport: process.env.TRANSPORT || 'TCP',
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT, 10) || 8877,
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
};
```

---

## **7. Monitoring et Logging**

### Logging Distribué
```typescript
@Injectable()
export class DistributedLogger implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const serviceName = process.env.SERVICE_NAME || 'unknown';
    
    console.log(`[${serviceName}] ${request.method} ${request.url}`);
    
    return next.handle().pipe(
      tap(data => {
        console.log(`[${serviceName}] Response sent:`, data);
      })
    );
  }
}
```

### Health Checks
```typescript
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: process.env.SERVICE_NAME,
      timestamp: new Date().toISOString(),
      dependencies: this.checkDependencies(),
    };
  }

  private checkDependencies() {
    // Vérification des services dépendants
    return {
      users_service: 'healthy',
      orders_service: 'healthy',
    };
  }
}
```

---

## **8. Bonnes Pratiques**

### 1. Découplage par Interface
```typescript
// Interface commune
export interface IUserService {
  getUser(id: string): Promise<User>;
  createUser(userData: any): Promise<User>;
}

// Implémentation spécifique
@Injectable()
export class UsersService implements IUserService {
  // Implémentation TCP
}
```

### 2. Gestion des Erreurs
```typescript
@Catch()
export class MicroserviceExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const pattern = host.getPattern();
    const error = {
      service: process.env.SERVICE_NAME,
      pattern,
      error: exception.message,
      timestamp: new Date().toISOString(),
    };
    
    // Logging centralisé
    console.error('Microservice error:', error);
    
    throw exception;
  }
}
```

### 3. Circuit Breaker
```typescript
@Injectable()
export class ResilientService {
  private circuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;

  async callWithCircuitBreaker(operation: () => Promise<any>) {
    if (this.circuitState === 'OPEN') {
      if (Date.now() - this.lastFailureTime > 30000) {
        this.circuitState = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.resetCircuit();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private resetCircuit() {
    this.circuitState = 'CLOSED';
    this.failureCount = 0;
  }

  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= 5) {
      this.circuitState = 'OPEN';
    }
  }
}
```

---

## **9. Référence Rapide**

| Concept | Décorateur/Pattern | Usage | Transport |
|---------|-------------------|-------|-----------|
| **Service** | `@MessagePattern` | TCP, RabbitMQ, Kafka |
| **Event** | `@EventPattern` | RabbitMQ, Kafka |
| **Client** | `@Inject()` + `ClientProxy` | Tous |
| **Gateway** | `@Controller` | HTTP |
| **Saga** | `@Saga()` | RxJS |
| **CQRS** | `@MessagePattern` | Tous |

---

## **10. Checklist Production**

### Sécurité
- [ ] Authentification centralisée dans le Gateway
- [ ] Communication chiffrée entre services
- [ ] Validation des messages entrants
- [ ] Rate limiting par service

### Performance
- [ ] Connection pooling pour les transports
- [ ] Circuit breakers pour appels externes
- [ ] Timeout configuration
- [ ] Monitoring des temps de réponse

### Fiabilité
- [ ] Retry automatique avec backoff
- [ ] Dead letter queues pour messages en échec
- [ ] Health checks pour chaque service
- [ ] Logging structuré centralisé

### Scalabilité
- [ ] Configuration horizontale facile
- [ ] Load balancing entre instances
- [ ] Auto-scaling basé sur métriques
- [ ] Partitionnement des données si nécessaire

Ce guide couvre les aspects essentiels pour construire des **microservices robustes, scalables et maintenables** avec NestJS.
