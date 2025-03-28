# Encapsulation en NestJS

Le mot qui résume **`abstract`**, **`private`**, **`protected`**, et **`readonly`** est **"Encapsulation"**.  

Ils servent à **contrôler l'accès aux données et méthodes** dans une classe.  

### **Résumé rapide :**
| Mot-clé        | Accès | But |
|---------------|---------------------|------------------------------|
| **`abstract`**  | Classe mère uniquement | Force l’implémentation dans une classe enfant |
| **`private`**   | Dans la classe uniquement | Cache complètement la donnée/méthode |
| **`protected`** | Classe + Enfants | Accessible par héritage, mais pas en dehors |
| **`readonly`**  | Partout | Empêche la modification après initialisation |

🔹 **En bref :** Ils améliorent la **sécurité**, **l'organisation du code** et la **maintenabilité** en NestJS ! 🚀

---

En **NestJS**, les mots-clés comme **`abstract`**, **`private`**, **`protected`**, et **`readonly`** sont utilisés pour améliorer la **structuration**, la **sécurité**, et la **maintenabilité** du code. Voici leur utilité et leurs cas d'utilisation en détail.

---

## **1. `abstract` (Classes et Méthodes Abstraites)**
Le mot-clé **`abstract`** est utilisé pour définir une classe ou une méthode qui **doit être implémentée par une classe dérivée**.

### **Cas d'utilisation en NestJS : Héritage et Injection de Dépendances**
On l’utilise souvent pour définir une **base générique** pour des services ou des contrôleurs, ce qui permet de réutiliser le code tout en imposant certaines règles.

### **Exemple : Service Abstrait pour une Gestion Générique**
```typescript
export abstract class BaseService<T> {
  constructor(protected readonly model: Model<T>) {}

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findById(id: string): Promise<T> {
    return this.model.findById(id).exec();
  }

  abstract create(data: any): Promise<T>; // Doit être défini par la classe enfant
}
```
#### **Utilisation dans un Service Spécifique**
```typescript
@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectModel(User.name) userModel: Model<User>) {
    super(userModel);
  }

  async create(data: CreateUserDto): Promise<User> {
    const newUser = new this.model(data);
    return newUser.save();
  }
}
```
👉 Ici, `BaseService` **impose une structure commune**, et `UserService` doit **implémenter `create()`**.

---

## **2. `private` (Encapsulation des Données)**
Le mot-clé **`private`** permet de **restreindre l'accès** à une propriété ou une méthode **à l'intérieur de la classe uniquement**.

### **Cas d'utilisation en NestJS : Protection des Données**
On l’utilise pour cacher certaines variables qui ne doivent pas être accessibles en dehors de la classe, comme une **variable d’état interne** ou une **méthode utilitaire**.

### **Exemple : Propriété privée dans un service**
```typescript
@Injectable()
export class AuthService {
  private secretKey = 'super-secret-key'; // Accessible uniquement dans cette classe

  validateToken(token: string): boolean {
    return token === this.secretKey; // Comparaison interne
  }
}
```
👉 Ici, `secretKey` **ne peut pas être modifiée ou accédée depuis l'extérieur**.

---

## **3. `protected` (Accès aux Classes Enfants)**
Le mot-clé **`protected`** est similaire à `private`, mais avec une différence clé :  
➡ **Il est accessible dans la classe et dans les classes qui en héritent**.

### **Cas d'utilisation en NestJS : Services ou Contrôleurs Étendus**
On l’utilise pour permettre aux classes dérivées d’accéder à certaines propriétés tout en les cachant du monde extérieur.

### **Exemple : Méthode `protected` dans un service**
```typescript
export class BaseService<T> {
  constructor(protected readonly model: Model<T>) {}

  protected logOperation(operation: string): void {
    console.log(`Opération ${operation} exécutée sur ${this.model.modelName}`);
  }
}
```
#### **Classe Fille qui Accède à `logOperation()`**
```typescript
@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectModel(User.name) userModel: Model<User>) {
    super(userModel);
  }

  async deleteUser(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
    this.logOperation('DELETE'); // Accessible grâce à `protected`
  }
}
```
👉 **`logOperation`** est accessible **dans `UserService`** mais **pas depuis l’extérieur**.

---

## **4. `readonly` (Propriétés en Lecture Seule)**
Le mot-clé **`readonly`** empêche la modification d’une variable après son initialisation.

### **Cas d'utilisation en NestJS : Définition d’Identifiants Constants**
On l’utilise pour **déclarer des valeurs qui ne doivent jamais être modifiées**, comme un **identifiant unique** ou une **configuration d’application**.

### **Exemple : Propriété `readonly` dans un Service**
```typescript
@Injectable()
export class ConfigService {
  readonly databaseUrl: string;

  constructor() {
    this.databaseUrl = 'mongodb://localhost:27017/mydb';
  }
}
```
👉 `databaseUrl` est **fixé une fois pour toutes** et **ne peut pas être changé**.

---

## **5. `static` (Propriétés et Méthodes de Classe)**
Le mot-clé **`static`** permet de **définir des propriétés et méthodes accessibles sans instancier la classe**.

### **Cas d'utilisation en NestJS : Constantes et Utilitaires**
On l’utilise souvent pour des méthodes ou valeurs **communes à toute l’application**, comme un **helper** ou un **générateur de tokens**.

### **Exemple : Méthode `static` dans une Classe Utilitaire**
```typescript
export class TokenHelper {
  static generateToken(): string {
    return Math.random().toString(36).substring(2);
  }
}
```
#### **Utilisation :**
```typescript
const token = TokenHelper.generateToken();
console.log(token);
```
👉 `generateToken()` peut être appelée **sans créer d’instance de `TokenHelper`**.

---

## **Conclusion**
| Mot-clé | Utilisation principale | Cas d'utilisation en NestJS |
|---------|------------------|---------------------------|
| **`abstract`** | Forcer l’implémentation dans une classe enfant | Base de services (`BaseService<T>`) |
| **`private`** | Empêcher l’accès depuis l’extérieur | Variables d’état interne (`secretKey`) |
| **`protected`** | Accès restreint aux classes filles | Méthodes utilitaires (`logOperation()`) |
| **`readonly`** | Propriétés en lecture seule | Configuration (`databaseUrl`) |
| **`static`** | Accès sans instanciation | Helpers (`TokenHelper.generateToken()`) |

---

Ces concepts sont très utiles pour **garder ton code organisé, sécurisé et maintenable** en NestJS. 


