# OOP

En plus de **l'encapsulation**, voici les autres concepts clés à maîtriser en programmation orientée objet (**POO**) et en **NestJS** :  

---

### **1️⃣ Encapsulation** 🔒  
**Définition** : Restreindre l'accès aux données et méthodes d'une classe pour protéger son état interne.  
**Mots-clés associés** : `private`, `protected`, `readonly`.  
**Exemple** :  
```typescript
class User {
  private password: string; // Accessible uniquement dans cette classe

  constructor(password: string) {
    this.password = password;
  }

  getPassword(): string {
    return 'Accès interdit'; // On contrôle ce qui est exposé
  }
}
```

---

### **2️⃣ Héritage** 👨‍👦  
**Définition** : Une classe peut hériter des propriétés et méthodes d'une autre classe pour éviter la duplication de code.  
**Mots-clés associés** : `extends`, `super`, `protected`.  
**Exemple** :  
```typescript
class Animal {
  protected sound(): string {
    return 'Fait un bruit';
  }
}

class Dog extends Animal {
  bark(): string {
    return this.sound(); // Accessible car protected
  }
}
```
**En NestJS** : On utilise souvent des **services génériques** avec héritage.

---

### **3️⃣ Polymorphisme** 🎭  
**Définition** : Une même méthode peut avoir **plusieurs formes** selon la classe qui l'implémente.  
**Mots-clés associés** : `abstract`, `override`, `implements`.  
**Exemple** :  
```typescript
abstract class Animal {
  abstract makeSound(): string; // Forcé dans les classes enfants
}

class Dog extends Animal {
  makeSound(): string {
    return 'Woof!';
  }
}

class Cat extends Animal {
  makeSound(): string {
    return 'Meow!';
  }
}
```
👉 **Avantage** : Permet d’écrire du code flexible et évolutif.

---

### **4️⃣ Abstraction** 🎭🚀  
**Définition** : Cacher les détails d'implémentation et exposer seulement l'essentiel.  
**Mots-clés associés** : `abstract`, `interface`.  
**Exemple avec une classe abstraite** :  
```typescript
abstract class Payment {
  abstract process(amount: number): void; // Oblige l’implémentation
}

class CreditCardPayment extends Payment {
  process(amount: number): void {
    console.log(`Paiement de ${amount}€ par carte`);
  }
}
```
**En NestJS** : On l’utilise pour définir des **services génériques** ou des **interfaces de dépôt (`Repository`)**.

---

### **5️⃣ Interfaces (Contrats de Code)** 📜  
**Définition** : Définir une structure sans implémentation, utilisée pour assurer une cohérence.  
**Mot-clé** : `interface`.  
**Exemple** :  
```typescript
interface User {
  name: string;
  email: string;
}

const user: User = { name: 'John', email: 'john@example.com' };
```
👉 **Différence avec `abstract`** : Une `interface` ne contient **pas d’implémentation**.

---

### **6️⃣ Injection de Dépendances (DI)** 🔗  
**Définition** : Passer des dépendances (services, repositories…) au lieu de les instancier directement.  
**Mot-clé** : `@Injectable()`, `@Inject()`, `constructor()`.  
**Exemple en NestJS** :  
```typescript
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {} // Injection
}
```
👉 **Avantage** : Facilite les **tests**, la **maintenance** et la **scalabilité**.

---

## **🔥 Résumé : Concepts POO à Maîtriser**
| Concept | Définition | Mots-clés clés | Exemple |
|---------|------------|---------------|---------|
| **Encapsulation** | Restreindre l'accès aux données | `private`, `protected`, `readonly` | Cacher un mot de passe |
| **Héritage** | Réutiliser du code dans une classe enfant | `extends`, `super` | Un `Dog` hérite d'`Animal` |
| **Polymorphisme** | Une même méthode avec différentes implémentations | `abstract`, `override`, `implements` | `makeSound()` pour `Dog` et `Cat` |
| **Abstraction** | Définir une structure sans implémentation directe | `abstract`, `interface` | Une classe `Payment` abstraite |
| **Interfaces** | Définir un contrat de code | `interface` | `User { name: string; email: string; }` |
| **Injection de dépendances (DI)** | Passer des services au lieu de les créer directement | `@Injectable()`, `constructor()` | `UserService` reçoit `UserRepository` |

---

💡 **Si tu maîtrises ces concepts, tu seras très à l'aise avec NestJS et la programmation orientée objet !** 🚀  

