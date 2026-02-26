# Surplus en profondeur 

Bien sûr ! Voici une explication détaillée avec des exemples pour chaque concept en **TypeScript/NestJS**.

---

## 1️⃣ `protected` en TypeScript
Le mot-clé **`protected`** limite l’accès à une propriété ou une méthode aux classes parentes et dérivées.

### Exemple :
```typescript
class Parent {
  protected message: string = "Hello from Parent";

  protected showMessage() {
    console.log(this.message);
  }
}

class Child extends Parent {
  display() {
    this.showMessage(); // ✅ Accessible ici
  }
}

const instance = new Child();
instance.display(); // "Hello from Parent"
// instance.showMessage(); ❌ Erreur : `showMessage` est `protected`
```

➡️ **Utilité dans NestJS** : Permet de sécuriser des méthodes internes dans les services.

---

## 2️⃣ `readonly` en TypeScript
Le mot-clé **`readonly`** empêche la modification d’une propriété après son initialisation.

### Exemple :
```typescript
class User {
  readonly id: number;
  
  constructor(id: number) {
    this.id = id;
  }

  updateId(newId: number) {
    // this.id = newId; ❌ Erreur : `id` est `readonly`
  }
}

const user = new User(1);
console.log(user.id); // ✅ Lecture possible
// user.id = 2; ❌ Erreur
```

➡️ **Utilité dans NestJS** : Sécuriser des valeurs comme des **dépendances injectées**.

Exemple dans un **service NestJS** :
```typescript
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  findAll() {
    return this.userRepository.find();
  }
}
```
Ici, `userRepository` est **readonly** pour éviter une réaffectation accidentelle.

---

## 3️⃣ `abstract` en TypeScript
Le mot-clé **`abstract`** est utilisé pour créer des **classes et méthodes abstraites** qui servent de modèles pour d’autres classes.

### Exemple :
```typescript
abstract class Animal {
  abstract makeSound(): void; // Méthode abstraite

  move(): void {
    console.log("Moving...");
  }
}

class Dog extends Animal {
  makeSound() {
    console.log("Woof!");
  }
}

const dog = new Dog();
dog.makeSound(); // "Woof!"
dog.move(); // "Moving..."
```

➡️ **Utilité dans NestJS** : Définir des **services de base** réutilisables.

Exemple dans un **service NestJS** :
```typescript
abstract class BaseService<T> {
  abstract findAll(): T[];
  abstract findOne(id: number): T;
}

@Injectable()
class UserService extends BaseService<User> {
  findAll(): User[] {
    return [{ id: 1, name: "Alice" }];
  }

  findOne(id: number): User {
    return { id, name: "Bob" };
  }
}
```

---

## 4️⃣ `super` en TypeScript
Le mot-clé **`super`** est utilisé pour appeler le constructeur ou les méthodes de la classe parente.

### Exemple :
```typescript
class Parent {
  constructor(public name: string) {}

  greet() {
    console.log(`Hello, I am ${this.name}`);
  }
}

class Child extends Parent {
  constructor(name: string, public age: number) {
    super(name); // Appel du constructeur parent
  }

  greet() {
    super.greet(); // Appel de la méthode `greet` du parent
    console.log(`I am ${this.age} years old`);
  }
}

const child = new Child("Alice", 10);
child.greet();
// Output :
// Hello, I am Alice
// I am 10 years old
```

➡️ **Utilité dans NestJS** : Héritage entre services et contrôleurs.

Exemple dans un **service NestJS** :
```typescript
class BaseService {
  constructor(protected readonly repository: any) {}

  findAll() {
    return this.repository.find();
  }
}

@Injectable()
class UserService extends BaseService {
  constructor(userRepository: UserRepository) {
    super(userRepository); // Appel du constructeur parent
  }
}
```

---

## 5 Services génériques en NestJS
Les **services génériques** permettent de créer un **service réutilisable** pour différents modèles.

### Exemple :
#### 1 Création d’un service générique
```typescript
@Injectable()
export class GenericService<T> {
  constructor(@InjectModel(T) private readonly model: Model<T>) {}

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findOne(id: string): Promise<T> {
    return this.model.findById(id).exec();
  }
}
```

#### 2 Utilisation pour un service spécifique
```typescript
@Injectable()
export class UserService extends GenericService<User> {
  constructor(@InjectModel(User) userModel: Model<User>) {
    super(userModel);
  }
}
```

**Avantages des services génériques** :
- Réduction du code **dupliqué**.
- Facilité de **maintenance**.
- Amélioration de la **scalabilité**.

---

## Conclusion
Ces concepts sont **très utiles** en TypeScript et NestJS :
- `protected` protège l'accès aux propriétés/méthodes.
- `readonly` empêche la modification des propriétés après initialisation.
- `abstract` force l'implémentation dans les classes enfants.
- `super` permet d'appeler des méthodes/constructeurs parents.
- **Services génériques** permettent de créer des services réutilisables.
