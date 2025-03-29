# Services 

En **NestJS**, il existe plusieurs types de **services** adaptés à différents cas d’utilisation. Voici un aperçu des principaux types de services avec des **exemples concrets**. 🚀

---

## 📌 1️⃣ Services classiques (Singleton)
### ➜ Description :
Ce sont les services les plus courants en **NestJS**. Par défaut, NestJS instancie ces services **une seule fois** (Singleton) et les partage dans toute l'application.

### 🔹 Exemple :
```typescript
@Injectable()
export class UserService {
  private users = [{ id: 1, name: "Alice" }];

  findAll() {
    return this.users;
  }
}
```

🔹 **Cas d'utilisation** :
- Services **CRUD** (User, Product, Order…)
- Gestion des **données en mémoire** (cache temporaire)
- Interaction avec des **repositories** (base de données)

---

## 📌 2️⃣ Services avec portée (`Scope`)
### ➜ Description :
Par défaut, NestJS crée une **instance unique** d’un service. Mais parfois, on a besoin d’un service avec un **cycle de vie spécifique** :
- **Request Scoped** (nouvelle instance par requête)
- **Transient Scoped** (nouvelle instance à chaque injection)

### 🔹 Exemple (Request Scoped) :
```typescript
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  private requestId: string;

  constructor() {
    this.requestId = Math.random().toString(36).substring(7);
  }

  getRequestId() {
    return this.requestId;
  }
}
```

### 🔹 Exemple (Transient Scoped) :
```typescript
@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {
  private instanceId: string = Math.random().toString(36).substring(7);

  getInstanceId() {
    return this.instanceId;
  }
}
```

🔹 **Cas d'utilisation** :
- **Logging** par requête (`RequestScoped`)
- **Gestion de sessions temporaires**
- **Dépendances instanciées dynamiquement** (`TransientScoped`)

---

## 📌 3️⃣ Services asynchrones (`@Injectable() + async`)
### ➜ Description :
Les services **asynchrones** sont utilisés lorsqu’un service dépend d’une **connexion externe** (base de données, API, etc.).

### 🔹 Exemple :
```typescript
@Injectable()
export class AsyncService {
  async fetchData(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => resolve("Data reçue !"), 2000);
    });
  }
}
```

🔹 **Cas d'utilisation** :
- Récupération de **données externes** (API, microservices)
- Interaction avec des **bases de données**
- Exécution de tâches en arrière-plan

---

## 📌 4️⃣ Services avec dépôt (`Repository Pattern`)
### ➜ Description :
Ce type de service encapsule la logique métier et les accès à la **base de données**.

### 🔹 Exemple avec `Mongoose` :
```typescript
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
```

🔹 **Cas d'utilisation** :
- **Encapsulation de la base de données**
- **Séparation des responsabilités** (`Service` ≠ `Controller`)
- **Facilité de test** avec des **mocks**

---

## 📌 5️⃣ Services génériques (`Generic Services`)
### ➜ Description :
Permet de créer une **base de service réutilisable** pour plusieurs entités.

### 🔹 Exemple :
```typescript
@Injectable()
export class GenericService<T> {
  constructor(@InjectModel(T) private readonly model: Model<T>) {}

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }
}
```
Utilisation pour un **service utilisateur** :
```typescript
@Injectable()
export class UserService extends GenericService<User> {
  constructor(@InjectModel(User) userModel: Model<User>) {
    super(userModel);
  }
}
```

🔹 **Cas d'utilisation** :
- **Réduction du code dupliqué**
- **Facilité d’extension** pour de nouvelles entités
- **Maintenance simplifiée**

---

## 📌 6️⃣ Services de communication (`Event-Driven`)
### ➜ Description :
Utilisé pour envoyer **des événements** entre services (via `EventEmitter`, Kafka, RabbitMQ…).

### 🔹 Exemple avec `EventEmitter` :
```typescript
@Injectable()
export class EventService {
  constructor(private eventEmitter: EventEmitter2) {}

  emitUserCreatedEvent(user: any) {
    this.eventEmitter.emit('user.created', user);
  }
}
```

🔹 **Cas d'utilisation** :
- **Microservices**
- **Traitement en arrière-plan**
- **Notifications et WebSockets**

---

## 📌 7️⃣ Services de cache (`CacheService`)
### ➜ Description :
Utilisé pour **optimiser les performances** en stockant des données en mémoire.

### 🔹 Exemple avec `CacheModule` :
```typescript
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setCache(key: string, value: any) {
    await this.cacheManager.set(key, value, { ttl: 3600 });
  }

  async getCache(key: string) {
    return await this.cacheManager.get(key);
  }
}
```

🔹 **Cas d'utilisation** :
- **Réduction des requêtes vers la base de données**
- **Stockage de sessions utilisateur**
- **Optimisation des performances**

---

## 📌 8️⃣ Services de sécurité (`AuthService`)
### ➜ Description :
Gère l’authentification et l’autorisation des utilisateurs.

### 🔹 Exemple avec JWT :
```typescript
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateToken(user: any) {
    return this.jwtService.sign({ id: user.id });
  }
}
```

🔹 **Cas d'utilisation** :
- **Authentification JWT**
- **Gestion des rôles et permissions**
- **OAuth2 / Social Login**

---

## 🎯 Conclusion
| **Type de Service**         | **Utilisation** |
|----------------------------|----------------|
| **Service classique** | Logique métier, CRUD |
| **Scoped Service** | Logging, sessions |
| **Asynchronous Service** | API, base de données |
| **Repository Pattern** | Encapsulation DB |
| **Service générique** | Code réutilisable |
| **Event Service** | Microservices, events |
| **Cache Service** | Optimisation, performance |
| **Auth Service** | Authentification, JWT |

Chaque type de service est adapté à un **besoin spécifique**.
