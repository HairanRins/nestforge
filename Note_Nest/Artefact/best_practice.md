# Les bonnes pratiques recommandées

Les bonnes pratiques recommandées pour développer des applications avec **NestJS** et **TypeScript**, organisées en sections clés :

---

### 1. **Structure du Projet**
- **Modularité** : 
  - Groupez le code par fonctionnalité (ex: `users/`, `products/`).
  - Chaque module contient ses fichiers (`*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.entity.ts`, `*.dto.ts`).
  - Évitez les modules monolithiques (privilégiez les sous-modules).
- **Exemple de structure** :
  ```
  src/
    ├── common/         # Utilitaires partagés (filters, guards, pipes)
    ├── config/         # Configuration
    ├── modules/        # Modules métier
    │    └── user/
    │         ├── dto/
    │         ├── entities/
    │         ├── user.controller.ts
    │         ├── user.service.ts
    │         └── user.module.ts
    └── main.ts
  ```

---

### 2. **Utilisation des Modules**
- **Single Responsibility Principle** : Un module par fonctionnalité.
- **Dynamic Modules** : Pour une configuration réutilisable (ex: base de données).
- **Évitez les dépendances circulaires** : Utilisez `forwardRef()` si nécessaire.

---

### 3. **Services et Injection de Dépendances (DI)**
- **Décorez avec `@Injectable()`** pour intégrer le système DI.
- **Déléguez la logique métier** aux services, pas aux contrôleurs.
- **Injectez les dépendances** via le constructeur (évitez les `new Service()`).

---

### 4. **Contrôleurs**
- **Restez légers** : Déchargez la logique vers les services.
- **Utilisez des DTOs** (Data Transfer Objects) avec `class-validator` pour la validation.
  ```typescript
  // create-user.dto.ts
  import { IsEmail, IsString } from 'class-validator';
  
  export class CreateUserDto {
    @IsEmail()
    email: string;
  
    @IsString()
    password: string;
  }
  ```
- **Décorateurs HTTP** : Utilisez `@Post()`, `@Get()`, etc., avec des codes de statut explicites (`@HttpCode(201)`).

---

### 5. **Validation et Gestion des Erreurs**
- **Pipes Globaux** : Activez `ValidationPipe` et `class-transformer` dans `main.ts`.
  ```typescript
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  ```
- **Exceptions Métier** : Créez des exceptions personnalisées (ex: `throw new NotFoundException('User not found')`).
- **Filtres d'Exception** : Utilisez `@Catch()` pour une gestion centralisée.

---

### 6. **Tests**
- **Tests Unitaires** : Utilisez `Jest` pour tester services et contrôleurs.
- **Tests E2E** : Simulez des requêtes HTTP avec `supertest`.
- **Mocks** : Mockez les dépendances avec `jest.mock()` ou des fournisseurs personnalisés.
  ```typescript
  const mockUserService = {
    findUser: jest.fn().mockResolvedValue({ id: 1, name: 'John' }),
  };
  ```

---

### 7. **Configuration**
- **Environnement** : Utilisez `@nestjs/config` pour les variables d'environnement.
  ```typescript
  // .env
  DATABASE_URL=postgres://user:password@localhost:5432/db
  ```
  ```typescript
  // app.module.ts
  ConfigModule.forRoot({ isGlobal: true });
  ```

---

### 8. **Sécurité**
- **Helmet et CORS** : Activez-les dans `main.ts`.
  ```typescript
  app.use(helmet());
  app.enableCors();
  ```
- **Authentification** : Implémentez des `Guards` (ex: JWT avec `@nestjs/jwt`).

---

### 9. **Base de Données**
- **ORM** : Utilisez `TypeORM` ou `Prisma` avec des repositories dédiés.
- **Migrations** : Versionnez les schémas de base de données.
- **Transactions** : Gérez les opérations atomiques correctement.

---

### 10. **Documentation (OpenAPI/Swagger)**
- **Annotez les Endpoints** : 
  ```typescript
  import { ApiBody, ApiResponse } from '@nestjs/swagger';
  
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created' })
  @Post()
  createUser(@Body() dto: CreateUserDto) { ... }
  ```
- **Générez la documentation** avec `SwaggerModule`.

---

### 11. **Performance**
- **Cache** : Utilisez `CacheModule` pour les données fréquemment accédées.
- **Logging** : Implémentez un logger structuré (ex: `winston` ou `pino`).
- **Compression** : Activez `compression` pour les réponses HTTP.

---

### 12. **Bonnes Pratiques TypeScript**
- **Strict Mode** : Activez `strict: true` dans `tsconfig.json`.
- **Évitez `any`** : Privilégiez des types explicites ou des génériques.
- **Interfaces vs Classes** : Utilisez des interfaces pour les types légers, des classes pour les DTOs avec validation.

---

### 13. **Déploiement**
- **Docker** : Containerisez l'application.
- **Environnements** : Utilisez des fichiers `.env.production`, `.env.staging`.
- **Health Checks** : Ajoutez un endpoint `/health` pour le monitoring.

---

### 14. **Outils**
- **ESLint/Prettier** : Assurez la cohérence du code.
- **Husky** : Exécutez des vérifications avant les commits.
- **CI/CD** : Automatisez les tests et déploiements.

---

En suivant ces pratiques, vous garantirez une application **maintenable**, **scalable** et **sécurisée** avec NestJS et TypeScript. 