# Guide Complet des Décorateurs NestJS

Ce document consolide tous les décorateurs NestJS avec leurs définitions, rôles et exemples pratiques.

---

## **Table des Matières**

1. [Décorateurs de Base](#1-décorateurs-de-base)
2. [Décorateurs HTTP](#2-décorateurs-http)
3. [Décorateurs de Paramètres](#3-décorateurs-de-paramètres)
4. [Décorateurs de Sécurité](#4-décorateurs-de-sécurité)
5. [Décorateurs de Données](#5-décorateurs-de-données)
6. [Décorateurs Transversaux](#6-décorateurs-transversaux)
7. [Décorateurs de Métadonnées](#7-décorateurs-de-métadonnées)
8. [Décorateurs WebSocket](#8-décorateurs-websocket)
9. [Décorateurs de Tâches Planifiées](#9-décorateurs-de-tâches-planifiées)
10. [Décorateurs de Vue](#10-décorateurs-de-vue)

---

## 1. **Décorateurs de Base**

### `@Module`
**Définition :** Déclare une classe comme module NestJS.

**Rôle :** Structure l'application en modules réutilisables.

**Exemple :**
```typescript
@Module({
  imports: [OtherModule],      // Modules dépendants
  controllers: [Controller],   // Contrôleurs du module
  providers: [Service],       // Services du module
  exports: [Service],         // Services exportés
})
export class FeatureModule {}
```

### `@Controller`
**Définition :** Déclare une classe comme contrôleur HTTP.

**Rôle :** Gère les requêtes entrantes et renvoie des réponses.

**Exemple :**
```typescript
@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return ['user1', 'user2'];
  }
}
```

### `@Injectable`
**Définition :** Indique qu'une classe peut être injectée par le conteneur DI.

**Rôle :** Marque les services, repositories, factories.

**Exemple :**
```typescript
@Injectable()
export class UsersService {
  getUsers() {
    return ['John', 'Jane'];
  }
}
```

---

## 2. **Décorateurs HTTP**

### `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`
**Définition :** Définissent les verbes HTTP pour les méthodes de contrôleur.

**Rôle :** Mappent les méthodes aux routes HTTP correspondantes.

**Exemple :**
```typescript
@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'Find all cats';
  }

  @Post()
  create(): string {
    return 'Create a cat';
  }

  @Put(':id')
  update(@Param('id') id: string): string {
    return `Update cat ${id}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return `Remove cat ${id}`;
  }
}
```

### `@All`
**Définition :** Gère toutes les méthodes HTTP sur une route.

**Rôle :** Capture tous les verbes (GET, POST, PUT, DELETE, etc.).

**Exemple :**
```typescript
@All('webhook')
handleWebhook(@Req() req: Request) {
  return { method: req.method, message: 'Webhook received' };
}
```

---

## 3. **Décorateurs de Paramètres**

### `@Param`
**Définition :** Extrait les paramètres de route.

**Rôle :** Accède aux paramètres dynamiques de l'URL.

**Exemple :**
```typescript
@Get(':id')
findOne(@Param('id') id: string): string {
  return `User ${id}`;
}
```

### `@Query`
**Définition :** Extrait les paramètres de query string.

**Rôle :** Accède aux paramètres après le ? dans l'URL.

**Exemple :**
```typescript
@Get()
search(@Query('q') query: string): string {
  return `Searching for: ${query}`;
}
```

### `@Body`
**Définition :** Extrait le corps de la requête.

**Rôle :** Accède aux données envoyées dans POST/PUT.

**Exemple :**
```typescript
@Post()
create(@Body() userData: any): string {
  return `User ${userData.name} created`;
}
```

### `@Headers`
**Définition :** Extrait les en-têtes HTTP.

**Rôle :** Accède aux métadonnées de la requête.

**Exemple :**
```typescript
@Get()
getInfo(@Headers('user-agent') userAgent: string): string {
  return `User-Agent: ${userAgent}`;
}
```

---

## 4. **Décorateurs de Sécurité**

### `@UseGuards`
**Définition :** Applique des guards à un contrôleur ou méthode.

**Rôle :** Contrôle l'accès aux routes.

**Exemple :**
```typescript
@UseGuards(AuthGuard)
@Controller('protected')
export class ProtectedController {
  @Get()
  getData() {
    return 'Protected data';
  }
}
```

### `@SetMetadata`
**Définition :** Attache des métadonnées personnalisées.

**Rôle :** Stocke des informations pour les guards/interceptors.

**Exemple :**
```typescript
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Roles('admin')
@Get('admin')
getAdminData() {
  return 'Admin data';
}
```

---

## 5. **Décorateurs de Données**

### `@InjectRepository`
**Définition :** Injecte un repository TypeORM.

**Rôle :** Facilite l'accès à la base de données.

**Exemple :**
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
```

### `@Inject`
**Définition :** Injection manuelle de dépendance.

**Rôle :** Injecte un provider par son token.

**Exemple :**
```typescript
@Injectable()
export class ConfigService {
  constructor(@Inject('CONFIG_OPTIONS') private options: any) {}
}
```

### `@Optional`
**Définition :** Rend une dépendance optionnelle.

**Rôle :** Pas d'erreur si la dépendance n'est pas fournie.

**Exemple :**
```typescript
@Injectable()
export class Service {
  constructor(@Optional() @Inject('LOGGER') private logger?: any) {}
}
```

---

## 6. **Décorateurs Transversaux**

### `@UseInterceptors`
**Définition :** Applique des intercepteurs.

**Rôle :** Transforme les requêtes/réponses.

**Exemple :**
```typescript
@UseInterceptors(LoggingInterceptor)
@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return ['user1', 'user2'];
  }
}
```

### `@UseFilters`
**Définition :** Applique des filtres d'exception.

**Rôle :** Gère les erreurs personnalisées.

**Exemple :**
```typescript
@UseFilters(HttpExceptionFilter)
@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    throw new BadRequestException('Invalid request');
  }
}
```

### `@UsePipes`
**Définition :** Applique des pipes à un contrôleur.

**Rôle :** Validation/transformation des données.

**Exemple :**
```typescript
@UsePipes(ValidationPipe)
@Controller('users')
export class UsersController {
  @Post()
  create(@Body() userData: any) {
    return this.usersService.create(userData);
  }
}
```

---

## 7. **Décorateurs de Métadonnées**

### `@Catch`
**Définition :** Déclare un filtre d'exception.

**Rôle :** Capture des types spécifiques d'exceptions.

**Exemple :**
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    response.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      message: exception.message,
    });
  }
}
```

### `@HttpCode`
**Définition :** Définit le code de statut HTTP.

**Rôle :** Contrôle le code de retour HTTP.

**Exemple :**
```typescript
@Post()
@HttpCode(204)
create() {
  return 'Created successfully';
}
```

### `@Header`
**Définition :** Ajoute des en-têtes HTTP.

**Rôle :** Personnalise les en-têtes de réponse.

**Exemple :**
```typescript
@Get()
@Header('Cache-Control', 'no-cache')
getData() {
  return 'Fresh data';
}
```

### `@Redirect`
**Définition :** Effectue une redirection HTTP.

**Rôle :** Redirige vers une autre URL.

**Exemple :**
```typescript
@Get('old')
@Redirect('https://example.com/new', 301)
redirectOld() {
  return 'Redirecting...';
}
```

---

## 8. **Décorateurs WebSocket**

### `@WebSocketGateway`
**Définition :** Déclare une classe comme gateway WebSocket.

**Rôle :** Gère les connexions temps réel.

**Exemple :**
```typescript
@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    return `Response: ${payload}`;
  }
}
```

### `@SubscribeMessage`
**Définition :** Écoute les messages WebSocket.

**Rôle :** Gère les messages entrants.

**Exemple :**
```typescript
@SubscribeMessage('chat')
handleChat(client: Socket, message: string): void {
  this.server.emit('chat', message);
}
```

---

## 9. **Décorateurs de Tâches Planifiées**

### `@Cron`
**Définition :** Exécute une méthode selon une expression cron.

**Rôle :** Planifie des tâches récurrentes.

**Exemple :**
```typescript
@Injectable()
export class TaskService {
  @Cron('0 0 * * *') // Tous les jours à minuit
  handleDailyTask() {
    console.log('Daily task executed');
  }
}
```

### `@Interval`
**Définition :** Exécute une méthode à intervalle fixe.

**Rôle :** Tâches périodiques en millisecondes.

**Exemple :**
```typescript
@Injectable()
export class TaskService {
  @Interval(5000) // Toutes les 5 secondes
  handleInterval() {
    console.log('Interval task executed');
  }
}
```

### `@Timeout`
**Définition :** Exécute une méthode après un délai.

**Rôle :** Tâches différées.

**Exemple :**
```typescript
@Injectable()
export class TaskService {
  @Timeout(10000) // Après 10 secondes
  handleTimeout() {
    console.log('Timeout task executed');
  }
}
```

---

## 10. **Décorateurs de Vue**

### `@Render`
**Définition :** Spécifie un template pour le rendu.

**Rôle :** Intégre les moteurs de templates.

**Exemple :**
```typescript
@Controller('views')
export class ViewsController {
  @Get('profile')
  @Render('profile') // profile.hbs, profile.ejs, etc.
  getProfile() {
    return { user: { name: 'John', age: 30 } };
  }
}
```

---

## **Référence Rapide**

| Catégorie | Décorateurs | Usage Principal |
|-----------|--------------|----------------|
| **Structure** | `@Module`, `@Controller`, `@Injectable` | Organisation de base |
| **HTTP** | `@Get`, `@Post`, `@Put`, `@Delete` | Routes REST |
| **Paramètres** | `@Param`, `@Query`, `@Body`, `@Headers` | Extraction de données |
| **Sécurité** | `@UseGuards`, `@SetMetadata`, `@Catch` | Authentification/autorisation |
| **Données** | `@InjectRepository`, `@Inject`, `@Optional` | Injection de dépendances |
| **Transversaux** | `@UseInterceptors`, `@UseFilters`, `@UsePipes` | Aspects cross-cutting |
| **Métadonnées** | `@HttpCode`, `@Header`, `@Redirect` | Configuration HTTP |
| **WebSocket** | `@WebSocketGateway`, `@SubscribeMessage` | Communication temps réel |
| **Tâches** | `@Cron`, `@Interval`, `@Timeout` | Planification |
| **Vue** | `@Render` | Rendu côté serveur |

---

## **Bonnes Pratiques**

1. **Combiner les décorateurs** : `@UseGuards(AuthGuard) @UsePipes(ValidationPipe)`
2. **Utiliser des DTOs** avec `class-validator` pour la validation
3. **Créer des décorateurs personnalisés** avec `SetMetadata`
4. **Appliquer globalement** avec `app.useGlobalGuards()`, `app.useGlobalPipes()`
5. **Structurer par fonctionnalité** : un décorateur par cas d'usage

Ces décorateurs permettent de construire des applications NestJS **robustes, sécurisées et maintenables** en suivant les meilleures pratiques du framework.
