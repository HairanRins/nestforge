# Key Terms

En NestJS, il y a plusieurs concepts et termes clés à connaître pour bien comprendre et structurer ton application. 
Voici une vue d'ensemble, y compris **`cron`** et d'autres termes importants, organisés par catégories :

---

## 📅 **1. Tâches planifiées : Cron**
- **`@Cron()`** (du module `@nestjs/schedule`) : permet d'exécuter une tâche à intervalle régulier ou à un moment précis.
- **`@Interval()`** : exécute une tâche à intervalles fixes (en millisecondes).
- **`@Timeout()`** : exécute une tâche une seule fois après un délai.
- **`ScheduleModule`** : module à importer pour activer les fonctions de planification.

```ts
import { Cron, CronExpression } from '@nestjs/schedule';

@Cron(CronExpression.EVERY_MINUTE)
handleCron() {
  console.log('Tâche exécutée chaque minute');
}
```

---

## 🔧 **2. Structure de base NestJS**
- **Module (`@Module`)** : un conteneur regroupant des composants liés (services, contrôleurs...).
- **Controller (`@Controller`)** : gère les routes HTTP entrantes.
- **Service (`@Injectable`)** : contient la logique métier.
- **Provider** : toute classe qui peut être injectée (service, repository...).

---

## 📦 **3. Injection de dépendances**
- **`@Injectable()`** : rend une classe injectable.
- **`constructor(private readonly service: MyService)`** : injection via le constructeur.
- **`useClass`, `useValue`, `useFactory`** : stratégies d’injection personnalisées dans les providers.

---

## 🧪 **4. Tests**
- **`Test.createTestingModule()`** : crée un module de test.
- **`supertest`** : utilisé pour tester les routes HTTP.
- **`jest`** : framework de test par défaut avec NestJS.

---

## 🔐 **5. Authentification / Sécurité**
- **Guards (`@UseGuards`)** : vérifient l’autorisation avant l’exécution d’une route.
- **Interceptors** : interceptent les requêtes ou réponses pour les modifier.
- **Pipes** : valident et transforme les données entrantes.
- **Middleware** : intervient avant le contrôleur (logging, CORS, etc.).

---

## 📡 **6. Requêtes HTTP**
- **`@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`** : décorateurs de routes.
- **`@Param()`, `@Body()`, `@Query()`** : pour extraire les données des requêtes.

---

## 🗃️ **7. Base de données**
- **TypeORM / Prisma / Mongoose** : ORM/ODM compatibles avec NestJS.
- **Repository pattern** : pour accéder à la base via des entités.

---

## ⚙️ **8. Configuration & Environnement**
- **`@nestjs/config`** : module pour gérer `.env`.
- **`ConfigModule` / `ConfigService`** : accède aux variables d’environnement.

---

## 🧩 **9. Modules avancés**
- **EventEmitterModule** : pour la communication entre modules via des événements.
- **CacheModule** : système de cache intégré.
- **ScheduleModule** : planification avec cron, timeout, interval.

---

## 🧵 **10. Exécution asynchrone**
- **async/await** : prise en charge native.
- **RxJS (Observable)** : utilisé avec WebSockets, gRPC, etc.

---
