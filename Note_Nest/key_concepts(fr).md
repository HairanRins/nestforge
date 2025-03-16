## 10 Concepts Clés de NestJS

NestJS est un framework pour construire des applications serveur Node.js efficaces et évolutives. 
Il utilise JavaScript progressif, est construit avec et supporte entièrement TypeScript, et combine des éléments de la POO (Programmation Orientée Objet), de la PF (Programmation Fonctionnelle) et de la PFR (Programmation Fonctionnelle Réactive). Ci-dessous, nous explorerons 10 concepts clés de NestJS, avec des explications, des exemples de code et des schémas si nécessaire.

### 1. Application

NestJS vous permet de créer différents types d'applications :

- **Application Serveur HTTP** : En utilisant `NestFactory.create`, vous pouvez créer des APIs et des serveurs web.
- **Application Microservice** : En utilisant `NestFactory.createMicroservice`, vous pouvez créer des microservices qui utilisent différents protocoles de transport comme TCP ou NATS.
- **Application Autonome** : En utilisant `NestFactory.createApplicationContext`, vous pouvez créer des applications sans écouteur réseau, adaptées pour des tâches planifiées ou des outils en ligne de commande.

### 2. Modules

Les modules sont les blocs de construction d'une application Nest. Une application Nest peut être visualisée comme un graphe de modules, 
avec un module racine au sommet. Ce module racine peut utiliser d'autres modules, qui à leur tour peuvent utiliser d'autres modules.

**Exemple :**

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

### 3. Décorateurs

Les décorateurs sont des fonctions spéciales qui peuvent être attachées à des méthodes, des classes et des propriétés pour modifier leur comportement
ou ajouter des métadonnées. Ils sont comme des accessoires qui donnent un pouvoir supplémentaire à vos classes.

**Exemple :**

```typescript
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

### 4. Contrôleurs

Les contrôleurs sont des classes annotées avec le décorateur `@Controller`. Ils gèrent les requêtes entrantes et renvoient des réponses. 
Vous pouvez définir des chemins de route dans le décorateur de contrôleur et ajouter des méthodes pour gérer les requêtes entrantes.

**Exemple :**

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'Cette action retourne tous les chats';
  }
}
```

### 5. Fournisseurs (Providers)

Les fournisseurs sont des classes qui peuvent être injectées dans d'autres classes en tant que dépendances. 
Ils sont comme des travailleurs indépendants que NestJS place là où ils sont nécessaires.

**Exemple :**

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  private readonly cats: string[] = ['Milo', 'Garfield', 'Tom'];

  findAll(): string[] {
    return this.cats;
  }
}
```

### 6. Middleware

Les fonctions middleware sont des fonctions qui ont accès à l'objet de requête (`req`), à l'objet de réponse (`res`) et 
à la fonction middleware suivante dans le cycle requête-réponse de l'application.

**Exemple :**

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Requête...');
    next();
  }
}
```

### 7. Pipes

Les pipes sont utilisés pour transformer et valider les données. Ils sont généralement utilisés dans le contexte de la gestion des paramètres de route 
et des payloads de requête.

**Exemple :**

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Échec de la validation');
    }
    return val;
  }
}
```

### 8. Gardes (Guards)

Les gardes sont utilisées pour déterminer si une requête doit être traitée par le gestionnaire de route ou non. 
Elles sont généralement utilisées pour l'authentification et l'autorisation.

**Exemple :**

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
```

### 9. Intercepteurs

Les intercepteurs sont utilisés pour lier une logique supplémentaire avant ou après l'exécution d'une méthode. Ils peuvent transformer le résultat retourné par une méthode ou intercepter les exceptions lancées par une méthode.

**Exemple :**

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Avant...');
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`Après... ${Date.now() - now}ms`)),
      );
  }
}
```

### 10. Filtres d'Exception

Les filtres d'exception sont utilisés pour intercepter les exceptions lancées par les gestionnaires de route et retourner une réponse personnalisée.

**Exemple :**

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```

### Schémas et Tableaux

**Graphe de Dépendance des Modules :**

```
Module Racine
   |
   v
CatsModule
   |
   v
CatsController
   |
   v
CatsService
```

**Flux d'Exécution du Middleware :**

```
Requête -> Middleware -> Gestionnaire de Route -> Réponse
```

**Flux d'Exécution de l'Intercepteur :**

```
Avant... -> Gestionnaire de Route -> Après...
```

**Flux d'Exécution du Filtre d'Exception :**

```
Gestionnaire de Route -> Exception -> Filtre d'Exception -> Réponse Personnalisée
```

En comprenant ces concepts clés, vous pouvez construire et gérer efficacement des applications NestJS. 
Chaque concept joue un rôle crucial dans l'architecture globale et la fonctionnalité de votre application.
