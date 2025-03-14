NestJS est un framework Node.js basé sur Express (ou Fastify) qui permet de construire des applications backend robustes et évolutives. Les **decorators** jouent un rôle central dans NestJS, car ils permettent d'ajouter des méta-données à vos classes, méthodes, propriétés ou paramètres pour configurer le comportement du framework.

Voici une liste des decorators les plus importants à connaître en NestJS, accompagnée de leurs définitions, rôles, exemples et cas d'utilisation :

---

### 1. **@Module**
#### Définition :
Déclare une classe comme étant un module NestJS. Un module regroupe des contrôleurs, des services, des fournisseurs, etc., pour organiser l'application en composants modulaires.

#### Rôle :
Permet de structurer l'application en modules réutilisables.

#### Exemple :
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [], // Modules dépendants
  controllers: [AppController], // Contrôleurs associés
  providers: [AppService], // Services/Fournisseurs associés
})
export class AppModule {}
```

#### Cas d'utilisation :
- Structurer une application en plusieurs modules logiques.
- Gérer les dépendances entre modules.

---

### 2. **@Controller**
#### Définition :
Déclare une classe comme étant un contrôleur HTTP. Les contrôleurs gèrent les requêtes entrantes et renvoient des réponses aux clients.

#### Rôle :
Associe une classe à une route HTTP spécifique.

#### Exemple :
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

#### Cas d'utilisation :
- Créer des points de terminaison RESTful pour interagir avec l'API.
- Centraliser la gestion des routes HTTP.

---

### 3. **@Injectable**
#### Définition :
Indique qu'une classe peut être injectée par le conteneur de dépendances de NestJS.

#### Rôle :
Marque une classe comme étant un service ou un fournisseur utilisable dans toute l'application via l'injection de dépendances.

#### Exemple :
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  getCats() {
    return ['Cat1', 'Cat2'];
  }
}
```

#### Cas d'utilisation :
- Créer des services réutilisables pour encapsuler la logique métier.
- Faciliter l'injection de dépendances.

---

### 4. **@Get, @Post, @Put, @Delete, @Patch**
#### Définition :
Ces decorators définissent les verbes HTTP associés à une méthode d'un contrôleur.

#### Rôle :
Spécifient le type de requête HTTP géré par une méthode.

#### Exemple :
```typescript
import { Controller, Get, Post, Put, Delete, Patch } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'Find all cats';
  }

  @Post()
  create(): string {
    return 'Create a new cat';
  }

  @Put(':id')
  update(@Param('id') id: string): string {
    return `Update cat with ID ${id}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return `Remove cat with ID ${id}`;
  }

  @Patch(':id')
  patch(@Param('id') id: string): string {
    return `Partially update cat with ID ${id}`;
  }
}
```

#### Cas d'utilisation :
- Implémenter des API RESTful conformes aux standards CRUD.

---

### 5. **@Body, @Query, @Param, @Headers**
#### Définition :
Ces decorators extraient des données spécifiques des requêtes HTTP.

#### Rôle :
Accèdent aux différentes parties d'une requête HTTP.

#### Exemple :
```typescript
import { Controller, Get, Post, Body, Query, Param, Headers } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() body: any): string {
    return `Created cat with data: ${JSON.stringify(body)}`;
  }

  @Get()
  findAll(@Query('limit') limit: number): string {
    return `Find all cats with limit: ${limit}`;
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return `Find cat with ID: ${id}`;
  }

  @Get('headers')
  getHeaders(@Headers('user-agent') userAgent: string): string {
    return `User-Agent: ${userAgent}`;
  }
}
```

#### Cas d'utilisation :
- Extraire des données envoyées par le client pour traiter les requêtes.

---

### 6. **@UseInterceptors, @UseFilters, @UseGuards**
#### Définition :
Ces decorators permettent d'attacher des intercepteurs, filtres ou gardes à une méthode ou un contrôleur.

#### Rôle :
Ajoutent des fonctionnalités transversales comme la validation, la transformation, ou la sécurité.

#### Exemple :
```typescript
import { Controller, Get, UseInterceptors, UseGuards } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';
import { AuthGuard } from '@nestjs/passport';

@Controller('cats')
@UseInterceptors(LoggingInterceptor)
export class CatsController {
  @Get()
  @UseGuards(AuthGuard())
  findAll(): string {
    return 'Find all cats';
  }
}
```

#### Cas d'utilisation :
- Ajouter des fonctionnalités comme la journalisation, la validation, ou l'authentification sans modifier le code principal.

---

### 7. **@InjectRepository**
#### Définition :
Utilisé avec TypeORM pour injecter un référentiel (repository) dans un service.

#### Rôle :
Facilite l'accès aux bases de données via les référentiels ORM.

#### Exemple :
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from './cat.entity';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private catsRepository: Repository<Cat>,
  ) {}

  findAll(): Promise<Cat[]> {
    return this.catsRepository.find();
  }
}
```

#### Cas d'utilisation :
- Intégrer une base de données relationnelle dans une application NestJS.

---

### 8. **@WebSocketGateway, @SubscribeMessage**
#### Définition :
Décorent une classe ou une méthode pour activer les fonctionnalités WebSocket.

#### Rôle :
Permettent de créer des connexions bidirectionnelles entre le serveur et les clients.

#### Exemple :
```typescript
import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway()
export class EventsGateway {
  @SubscribeMessage('message')
  handleMessage(@MessageBody() content: string): string {
    return `Message received: ${content}`;
  }
}
```

#### Cas d'utilisation :
- Implémenter des fonctionnalités temps réel comme les notifications ou les chats.

---

### 9. **@Schedule**
#### Définition :
Décore une méthode pour exécuter une tâche planifiée à intervalle régulier.

#### Rôle :
Programme des tâches asynchrones ou périodiques.

#### Exemple :
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class CronService implements OnModuleInit {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  onModuleInit() {
    setInterval(() => {
      console.log('Task executed every 5 seconds');
    }, 5000);
  }
}
```

#### Cas d'utilisation :
- Planifier des travaux récurrents comme l'envoi d'e-mails ou la mise à jour de données.

---

### 10. **@Middleware**
#### Définition :
Décore une classe pour activer un middleware personnalisé.

#### Rôle :
Ajoute des traitements avant ou après la réponse HTTP.

#### Exemple :
```typescript
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(loggerMiddleware).forRoutes('*');
  }
}

function loggerMiddleware(req, res, next) {
  console.log(`Request URL: ${req.url}`);
  next();
}
```

#### Cas d'utilisation :
- Implémenter des middlewares pour la journalisation, l'authentification, etc.

---

### Conclusion
Les decorators sont au cœur de NestJS et permettent de structurer l'application, de configurer les comportements, et de simplifier le développement grâce à des annotations claires et expressives. En maîtrisant ces decorators, vous serez capable de créer des applications backend performantes et bien organisées.
