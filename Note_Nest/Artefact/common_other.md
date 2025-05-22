# Approfondies

Dans un projet **NestJS**, le dossier ou module `common` joue un rôle central en regroupant les éléments réutilisables dans toute l’application. Il permet d’éviter la duplication de code et favorise une architecture propre et modulaire.

---

### **1. L’importance du `common` dans NestJS**

Le répertoire ou module `common` contient des **ressources partagées**, comme :

* **Filtres d’exception personnalisés** (`HttpExceptionFilter`)
* **Pipes de validation** (`ValidationPipe`)
* **Intercepteurs** (`LoggingInterceptor`, `TransformInterceptor`)
* **Guards** (`AuthGuard`, `RolesGuard`)
* **Constantes globales** (`APP_CONSTANTS`, messages d’erreur)
* **Décorateurs personnalisés** (`@CurrentUser()`, `@Public()`)
* **Interfaces et types communs**

> **But :** Centraliser tout ce qui est **utilisable dans plusieurs modules** pour améliorer la lisibilité, la testabilité et la réutilisabilité du code.

---

### **2. Les dépendances importantes dans NestJS et leurs rôles**

Voici les principales **dépendances courantes** avec leur **fonction** :

| Dépendance                              | Rôle                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------- |
| `@nestjs/common`                        | Fournit les outils NestJS de base (decorators, pipes, guards, interceptors, etc.) |
| `@nestjs/core`                          | Moteur de base de NestJS : gestion de modules, injection de dépendances           |
| `@nestjs/platform-express`              | Intègre NestJS avec Express (ou `@nestjs/platform-fastify`)                       |
| `@nestjs/swagger`                       | Intégration Swagger pour la documentation automatique de l’API REST               |
| `class-validator`                       | Validation des DTOs via des decorators (`@IsString`, `@IsNotEmpty`, etc.)         |
| `class-transformer`                     | Transformation des objets (ex: `plainToInstance`)                                 |
| `@nestjs/config`                        | Gestion de configuration via fichiers `.env`                                      |
| `@nestjs/jwt`                           | Authentification JWT                                                              |
| `@nestjs/passport` + `passport`         | Authentification modulaire avec stratégies personnalisables                       |
| `@nestjs/mongoose` ou `@nestjs/typeorm` | Intégration avec MongoDB ou bases SQL                                             |
| `rxjs`                                  | Utilisé en interne par NestJS pour la programmation réactive (Observables)        |

---

### **3. Exemple d’un module `common`**

```bash
src/
├── common/
│   ├── constants/
│   │   └── app.constants.ts
│   ├── decorators/
│   │   └── public.decorator.ts
│   ├── guards/
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   └── logging.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── pipes/
│       └── validation.pipe.ts
```

Ces fichiers sont ensuite **importés** dans les autres modules.

---
