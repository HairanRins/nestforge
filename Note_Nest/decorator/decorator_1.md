# Les autres **decorators NestJS** avec les éléments manquants, organisés par catégories :
decorators essentiels de NestJS, notamment ceux pour la validation, les pipes, les guards personnalisés, et d'autres fonctionnalités avancées.  

---

### 11. **@Req / @Request, @Res / @Response, @Next**
#### Définition :
Permettent d'accéder aux objets natifs de la plateforme sous-jacente (Express/Fastify).

#### Rôle :
- `@Req()` / `@Request()` : Injection de l'objet requête HTTP complet
- `@Res()` / `@Response()` : Injection de l'objet réponse HTTP (désactive le mode standard de NestJS)
- `@Next()` : Injection de la fonction `next()` pour le middleware

#### Exemple :
```typescript
import { Controller, Get, Req, Res, Next } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Controller('native')
export class NativeController {
  @Get()
  findAll(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    // Accès natif à Express
    res.status(200).json({ message: 'Native response', ip: req.ip });
  }
}
```

#### Attention :
L'utilisation de `@Res()` désactive les fonctionnalités automatiques de NestJS (interceptors, serialization). Utilisez `@Res({ passthrough: true })` pour combiner les deux approches.

---

### 12. **@Session, @Ip, @HostParam**
#### Définition :
Extraient des données spécifiques de la requête.

#### Rôle :
- `@Session()` : Accès aux données de session
- `@Ip()` : Récupération de l'adresse IP du client
- `@HostParam()` : Paramètres de sous-domaine (subdomain routing)

#### Exemple :
```typescript
import { Controller, Get, Session, Ip, HostParam } from '@nestjs/common';

@Controller('session')
export class SessionController {
  @Get()
  getInfo(
    @Session() session: Record<string, any>,
    @Ip() ip: string,
    @HostParam('account') account: string, // Pour les sous-domaines type :account.example.com
  ) {
    return { sessionId: session.id, clientIp: ip, account };
  }
}
```

---

### 13. **@Inject, @Optional, @InjectRepository**
#### Définition :
Gèrent l'injection de dépendances manuelle et optionnelle.

#### Rôle :
- `@Inject(token)` : Injection manuelle par token personnalisé
- `@Optional()` : Rend une dépendance optionnelle (pas d'erreur si non fournie)
- `@InjectRepository(Entity)` : Spécifique à TypeORM pour injecter un repository

#### Exemple :
```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class ConfigService {
  constructor(
    @Inject('CONFIG_OPTIONS') private options: any,
    @Optional() @Inject('LOGGER') private logger?: any, // Optionnel
  ) {}
  
  getConfig() {
    this.logger?.log('Getting config'); // Safe call grâce à @Optional
    return this.options;
  }
}
```

---

### 14. **@UsePipes, @UseFilters, @UseGuards, @UseInterceptors**
#### Définition :
Appliquent des pipes, filtres, guards et intercepteurs à différents niveaux.

#### Rôle :
- `@UsePipes()` : Validation/transformation des données entrantes
- `@UseFilters()` : Gestion personnalisée des exceptions
- `@UseGuards()` : Contrôle d'accès et autorisation
- `@UseInterceptors()` : Transformation des réponses, logging, caching

#### Exemple avancé :
```typescript
import { Controller, Get, UsePipes, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { RolesGuard } from './guards/roles.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';

@Controller('advanced')
@UseInterceptors(LoggingInterceptor)
@UseFilters(HttpExceptionFilter)
export class AdvancedController {
  
  @Get()
  @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseInterceptors(TransformInterceptor) // Intercepteur spécifique à cette route
  findAll() {
    return { data: 'sensitive data' };
  }
}
```

---

### 15. **@Catch**
#### Définition :
Déclare une classe comme filtre d'exceptions, ciblant des types d'erreurs spécifiques.

#### Rôle :
Capture et transforme les exceptions pour renvoyer des réponses HTTP appropriées.

#### Exemple :
```typescript
import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch(HttpException) // Peut cibler plusieurs types: @Catch(HttpException, TypeError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}

// Pour capturer TOUTES les exceptions
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Gestion globale
  }
}
```

---

### 16. **@SetMetadata**
#### Définition :
Attache des métadonnées personnalisées aux handlers ou contrôleurs.

#### Rôle :
Stocke des données accessibles via `Reflector` dans les guards et intercepteurs.

#### Exemple :
```typescript
import { SetMetadata } from '@nestjs/common';

// Création d'un decorator personnalisé basé sur SetMetadata
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Utilisation dans un guard
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    
    if (isPublic) return true;
    if (!roles) return true;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return roles.some(role => user?.roles?.includes(role));
  }
}
```

---

### 17. **@HttpCode, @Header, @Redirect**
#### Définition :
Contrôlent la réponse HTTP au niveau des méthodes.

#### Rôle :
- `@HttpCode(status)` : Définit le code de statut HTTP de la réponse
- `@Header(name, value)` : Ajoute des headers personnalisés
- `@Redirect(url, statusCode)` : Redirection HTTP

#### Exemple :
```typescript
import { Controller, Post, HttpCode, Header, Redirect, Get } from '@nestjs/common';

@Controller('response')
export class ResponseController {
  
  @Post()
  @HttpCode(204) // No Content au lieu de 201 par défaut pour POST
  @Header('Cache-Control', 'none')
  create() {
    // Logique de création
  }

  @Get('old-route')
  @Redirect('https://example.com/new-route', 301) // Redirection permanente
  redirectOldRoute() {
    // Peut aussi retourner un objet { url: string, statusCode: number }
    return { url: 'https://example.com/alternative', statusCode: 302 };
  }
}
```

---

### 18. **@Render**
#### Définition :
Spécifie le template à utiliser pour le rendu côté serveur (SSR).

#### Rôle :
Intègre des moteurs de template (Handlebars, EJS, Pug) pour générer des vues HTML.

#### Exemple :
```typescript
import { Controller, Get, Render } from '@nestjs/common';

@Controller('views')
export class ViewsController {
  
  @Get('profile')
  @Render('profile') // profile.hbs, profile.ejs, etc.
  getProfile() {
    return { 
      user: { name: 'John Doe', age: 30 },
      title: 'Profil utilisateur'
    }; // Ces données seront injectées dans le template
  }
}
```

---

### 19. **@All, @Options, @Head**
#### Définition :
Décorateurs de routage HTTP supplémentaires.

#### Rôle :
- `@All()` : Capture toutes les méthodes HTTP sur une route
- `@Options()` : Gère les requêtes OPTIONS (CORS preflight)
- `@Head()` : Gère les requêtes HEAD (métadonnées sans body)

#### Exemple :
```typescript
import { Controller, All, Options, Head, Req } from '@nestjs/common';

@Controller('webhook')
export class WebhookController {
  
  @All('generic') // Capture GET, POST, PUT, DELETE, etc.
  handleGeneric(@Req() req: Request) {
    return { method: req.method, message: 'Generic handler' };
  }

  @Options('preflight')
  handleOptions() {
    // Gestion CORS preflight
    return { allowedMethods: ['GET', 'POST'] };
  }

  @Head('status')
  checkStatus() {
    // Renvoie uniquement les headers, pas de body
    return; // Le statut 200 OK suffit
  }
}
```

---

### 20. **@Global**
#### Définition :
Rend un module disponible globalement sans besoin d'importation explicite.

#### Rôle :
Évite d'importer le même module dans chaque module consommateur.

#### Exemple :
```typescript
import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Global() // Ce module sera accessible partout
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

---

### 21. **Decorators personnalisés avec `createParamDecorator`**
#### Définition :
Création de decorators de paramètres sur mesure.

#### Rôle :
Encapsule la logique d'extraction des données de requête pour la réutiliser.

#### Exemple :
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorator pour extraire l'utilisateur courant
export const CurrentUser = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    // Si 'data' est spécifié, retourne une propriété spécifique
    return data ? user?.[data] : user;
  },
);

// Decorator pour extraire les cookies
export const Cookies = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  },
);

// Utilisation
@Controller('users')
export class UserController {
  @Get('me')
  getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  @Get('me/email')
  getCurrentUserEmail(@CurrentUser('email') email: string) {
    return { email };
  }
}
```

---

### 22. **@Bind (JavaScript/Decorators legacy)**
#### Définition :
Utilisé dans les projets JavaScript purs (sans TypeScript) pour lier les decorators de paramètres.

#### Rôle :
Équivalent JavaScript de l'injection de paramètres par decorators.

#### Exemple :
```javascript
import { Controller, Get, Bind, Req, Res } from '@nestjs/common';

@Controller('js-route')
export class JsController {
  @Get()
  @Bind(Req(), Res()) // Nécessaire en JavaScript pur
  findAll(req, res) {
    res.send('Hello from JS controller');
  }
}
```

---

### Tableau récapitulatif des catégories

| Catégorie | Decorators clés | Usage principal |
|-----------|----------------|-----------------|
| **Modules** | `@Module`, `@Global` | Structure et portée de l'application |
| **Contrôleurs** | `@Controller`, `@Get`, `@Post`, etc. | Routage HTTP |
| **Providers** | `@Injectable`, `@Inject`, `@Optional` | Injection de dépendances |
| **Paramètres** | `@Body`, `@Query`, `@Param`, `@Req`, `@Res`, `@Ip`, `@Session` | Extraction des données de requête |
| **Transversaux** | `@UseGuards`, `@UseInterceptors`, `@UseFilters`, `@UsePipes` | Aspects cross-cutting |
| **Métadonnées** | `@SetMetadata`, `@Catch`, `@HttpCode`, `@Header` | Configuration et métadonnées |
| **WebSocket** | `@WebSocketGateway`, `@SubscribeMessage` | Communication temps réel |
| **Tâches** | `@Cron`, `@Interval`, `@Timeout` | Programmation de tâches |
| **Vues** | `@Render`, `@Redirect` | Rendu et redirection |

Ces decorators supplémentaires permettent de maîtriser tous les aspects de NestJS : validation fine, gestion d'erreurs, accès natif HTTP, métadonnées personnalisées, 
et création d'API réutilisables et maintenables.
