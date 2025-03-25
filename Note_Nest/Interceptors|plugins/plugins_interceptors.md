# Plugins et Interceptors dans NestJS (TypeScript)

## Interceptors

Les interceptors dans NestJS sont des classes annotées avec `@Injectable()` qui implémentent l'interface `NestInterceptor`. Ils permettent de:

1. Modifier les requêtes entrantes et les réponses sortantes
2. Transformer les résultats retournés
3. Étendre le comportement des méthodes
4. Gérer les exceptions
5. Implémenter la logique cross-cutting (comme la mise en cache, la journalisation, etc.)

### Création d'un Interceptor

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}
```

### Utilisation d'un Interceptor

Vous pouvez appliquer un interceptor à différents niveaux:

1. **Niveau contrôleur**:
```typescript
@UseInterceptors(LoggingInterceptor)
@Controller('cats')
export class CatsController {}
```

2. **Niveau méthode**:
```typescript
@UseInterceptors(LoggingInterceptor)
@Get()
findAll() {
  return this.catsService.findAll();
}
```

3. **Globalement**:
```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());
```

### Exemple: Transformer la réponse

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data => ({ data })));
  }
}
```

Cet interceptor transforme toutes les réponses en un objet avec une propriété `data`.

## Plugins

Dans NestJS, le terme "plugin" est moins formel que "interceptor". Les plugins peuvent faire référence à:

1. Modules externes que vous intégrez dans votre application
2. Middlewares personnalisés
3. Bibliothèques qui étendent les fonctionnalités de NestJS

### Exemple de Middleware (plugin)

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Request...`);
    next();
  }
}
```

### Application du Middleware

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // Pour toutes les routes
  }
}
```

### Exemple de Plugin: Cache

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getData(key: string) {
    const cachedData = await this.cacheManager.get(key);
    if (cachedData) {
      return cachedData;
    }
    
    const freshData = await this.fetchFreshData(); // votre méthode
    await this.cacheManager.set(key, freshData, 60000); // TTL 60s
    return freshData;
  }
}
```

## Différences clés

| Feature          | Interceptor                          | Middleware (Plugin)                 |
|------------------|--------------------------------------|-------------------------------------|
| Accès            | Accès au contexte d'exécution        | Accès aux objets Request/Response   |
| Phase            | Après middleware, avant gestionnaire| Avant les interceptors              |
| Transformation   | Peut transformer la réponse          | Ne peut pas transformer la réponse  |
| Observables      | Travaille avec des Observables       | Travaille avec des callbacks        |

## Cas d'utilisation avancés

### Interceptor pour timeout

```typescript
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000), // Timeout après 5 secondes
      catchError(err => {
        if (err instanceof TimeoutError) {
          throw new RequestTimeoutException();
        }
        return throwError(err);
      }),
    );
  }
}
```

### Plugin pour les headers

```typescript
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  }
}
```

Ces exemples montrent comment les interceptors et les plugins/middlewares peuvent être utilisés pour étendre et personnaliser le comportement de votre application NestJS.
