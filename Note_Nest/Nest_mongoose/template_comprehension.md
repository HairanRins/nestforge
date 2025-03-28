# Full Comprehension

### 📌 **Les Points Essentiels de NestJS avec MongoDB (Mongoose)**  

NestJS est un framework modulaire et structuré pour Node.js qui facilite l'intégration avec MongoDB grâce à **Mongoose**. Voici les **grands points** à connaître pour utiliser MongoDB avec NestJS efficacement.  

---

## **1️⃣ Installation et Configuration de Mongoose**
### **🔹 Installation de Mongoose et du package NestJS**
```sh
npm install @nestjs/mongoose mongoose
```
Ce package permet d'intégrer Mongoose dans NestJS via un module spécifique.

### **🔹 Configuration dans `app.module.ts`**
On connecte NestJS à MongoDB en important `MongooseModule` :
```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'), // Connexion MongoDB
  ],
})
export class AppModule {}
```

🔹 **Options supplémentaires** :  
- `useNewUrlParser: true`  
- `useUnifiedTopology: true`  
- Gestion de l’authentification (`user`, `password`)  

---

## **2️⃣ Définition des Schémas et Modèles**
NestJS utilise **Mongoose avec les décorateurs** pour définir des schémas.

### **🔹 Déclaration d'un Schéma (`user.schema.ts`)**
```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema() // Décorateur pour définir un schéma
export class User {
  @Prop({ required: true }) // Définit un champ obligatoire
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  age: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

---

## **3️⃣ Création d’un Module, Service et Contrôleur**
Pour respecter l’architecture modulaire de NestJS, on sépare les **modules**, **services** et **contrôleurs**.

### **🔹 Création d’un Module (`user.module.ts`)**
```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

### **🔹 Création du Service (`user.service.ts`)**
Ce service contient la logique métier (CRUD sur MongoDB).
```ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: Partial<User>): Promise<User> {
    return this.userModel.create(data);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
```

### **🔹 Création du Contrôleur (`user.controller.ts`)**
Ce contrôleur gère les routes de l'API.

```ts
import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() data: Partial<User>) {
    return this.userService.create(data);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<User>) {
    return this.userService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
```

---

## **4️⃣ Gestion des Relations entre Modèles**
Dans MongoDB, les relations sont généralement gérées via des **références** (`ObjectId`) et `populate()`.

### **🔹 Exemple : Un utilisateur a plusieurs "posts"**
**Définition du schéma `post.schema.ts` :**
```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../user/user.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop()
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }) // Référence à un utilisateur
  author: User;
}

export const PostSchema = SchemaFactory.createForClass(Post);
```

**Utilisation de `populate()` dans le service :**
```ts
async findAll() {
  return this.postModel.find().populate('author').exec();
}
```

---

## **5️⃣ Middleware et Hooks Mongoose**
On peut exécuter du code avant ou après certaines opérations grâce aux **middlewares Mongoose**.

### **🔹 Exemple : Hasher le mot de passe avant de sauvegarder un utilisateur**
```ts
import * as bcrypt from 'bcrypt';

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

---

## **6️⃣ Transactions MongoDB avec Mongoose**
Si vous avez plusieurs opérations critiques à exécuter, utilisez **les transactions avec Mongoose**.

```ts
import { Connection } from 'mongoose';

async function createUserWithPost(userData, postData, connection: Connection) {
  const session = await connection.startSession();
  session.startTransaction();
  try {
    const user = await new UserModel(userData).save({ session });
    postData.author = user._id;
    await new PostModel(postData).save({ session });

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
```

---

## **📌 Récapitulatif des Points Clés**
| **Concept**         | **Explication** |
|---------------------|----------------|
| **Installation**    | `npm install @nestjs/mongoose mongoose` |
| **Connexion**       | `MongooseModule.forRoot('mongodb://localhost/nest')` |
| **Schéma**         | Utilisation de `@Schema()`, `@Prop()` |
| **Service**         | `@InjectModel(User.name) private userModel: Model<UserDocument>` |
| **CRUD**            | `.create()`, `.find()`, `.findById()`, `.updateOne()`, `.deleteOne()` |
| **Relations**       | `@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })` + `.populate()` |
| **Middleware**      | `UserSchema.pre('save', function () { ... })` |
| **Transactions**    | `session.startTransaction()` pour garantir l'intégrité des données |

---

🔥 **NestJS + MongoDB (Mongoose) est une combinaison puissante** pour créer des APIs robustes et modulaires. 

---

### **Explication de `create(data: Partial<User>): Promise<User>`**  

Cette méthode fait partie du **service (`user.service.ts`)** et est responsable de **créer un nouvel utilisateur dans la base de données MongoDB** via Mongoose. Décomposons chaque élément :

---

### **1️⃣ Définition et rôle de la fonction**
```ts
async create(data: Partial<User>): Promise<User> {
  return this.userModel.create(data);
}
```
- `async` → La fonction est **asynchrone**, car l'opération d'écriture en base de données prend du temps.
- `create(data: Partial<User>)` → La fonction prend un **objet `data`** qui contient certaines (ou toutes) les propriétés d'un `User`.
- `Partial<User>` → Type TypeScript indiquant que **toutes les propriétés sont optionnelles**, donc on peut passer un objet partiel (ex: `{ name: "John" }` sans `email` ni `age`).
- `Promise<User>` → Retourne une **promesse** qui se résoudra en un objet `User` (l’utilisateur enregistré en base).

---

### **2️⃣ Fonctionnement de `this.userModel.create(data)`**
Dans le contexte de Mongoose :
```ts
this.userModel.create(data);
```
- `this.userModel` est une **instance de modèle Mongoose** (`Model<UserDocument>`).
- `.create(data)` est une méthode Mongoose qui :
  - **Valide les données** selon le schéma `UserSchema`.
  - **Ajoute l’objet en base de données** et retourne l'objet créé.

---

### **3️⃣ Exemple d'utilisation**
#### **Cas 1 : Création d’un utilisateur complet**
```ts
await userService.create({ name: "Alice", email: "alice@mail.com", age: 30 });
```
🔹 Enregistre `{ name: "Alice", email: "alice@mail.com", age: 30 }` dans MongoDB.

#### **Cas 2 : Création avec des champs partiels**
```ts
await userService.create({ name: "Bob" });
```
🔹 Enregistre `{ name: "Bob" }` en base (les autres champs seront `undefined` ou auront des valeurs par défaut).

---

### **4️⃣ Différence avec `new this.userModel(data).save()`**
On aurait pu écrire la méthode différemment :
```ts
async create(data: Partial<User>): Promise<User> {
  const user = new this.userModel(data);
  return user.save();
}
```
Différences :
- `.create(data)` → **Crée et sauvegarde directement** en une seule étape.
- `new this.userModel(data).save()` → **Crée un objet puis l’enregistre** explicitement.

---

## **📌 Conclusion**
Cette méthode est une manière simple et efficace de créer un utilisateur avec **Mongoose** dans **NestJS**.  
Elle :
✅ Simplifie l’ajout en base  
✅ Gère la validation et les valeurs par défaut  
✅ Utilise **TypeScript** pour s’assurer que `data` respecte la structure de `User`

---

### **Refonte de l'Exemple avec Repository et DTO dans NestJS + Mongoose** 🚀  

Dans une application **NestJS**, l'utilisation de **Repositories** et **DTOs** (Data Transfer Objects) est une **bonne pratique** pour structurer le code de manière **claire et évolutive**.  

Voici **une version améliorée** de l'exemple en intégrant **Repository Pattern** et **DTOs** pour la gestion des utilisateurs.

---

## **1️⃣ Création du DTO (`user.dto.ts`)**
Les DTOs permettent de **structurer les données envoyées** dans les requêtes.  
On va créer un **DTO pour la création d’un utilisateur** et un autre pour la mise à jour.

```ts
import { IsEmail, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;
}
```
✅ **Avantages des DTOs :**  
- Validation automatique des champs avec `class-validator`.  
- Sécurité en **contrôlant les entrées utilisateur** avant enregistrement.

---

## **2️⃣ Création du Repository (`user.repository.ts`)**
Un **Repository** encapsule l’accès aux données et offre une couche d’abstraction.

```ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: CreateUserDto): Promise<User> {
    return this.userModel.create(userData);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
```
✅ **Pourquoi un Repository ?**  
- Sépare la **logique d’accès aux données** du service.  
- Facilite les **tests unitaires** et **le changement de base de données** si nécessaire.

---

## **3️⃣ Mise à Jour du Service (`user.service.ts`)**
Le **Service** va utiliser le **Repository** au lieu d’accéder directement au modèle Mongoose.

```ts
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(data: CreateUserDto): Promise<User> {
    return this.userRepository.create(data);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne(id);
  }

  async update(id: string, data: UpdateUserDto): Promise<User | null> {
    return this.userRepository.update(id, data);
  }

  async delete(id: string): Promise<User | null> {
    return this.userRepository.delete(id);
  }
}
```
✅ **Pourquoi ce Service ?**  
- **Encapsule la logique métier** et appelle uniquement le Repository.  
- Facile à **modifier sans impacter la base de données**.  

---

## **4️⃣ Mise à Jour du Contrôleur (`user.controller.ts`)**
Le **Contrôleur** utilise maintenant les DTOs et le Service.

```ts
import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
```
✅ **Pourquoi ce Contrôleur ?**  
- Il utilise **les DTOs** pour **valider** les entrées.  
- Il garde une **logique claire et lisible**.  

---

## **5️⃣ Mise à Jour du Module (`user.module.ts`)**
On **importe** le Repository et on l’enregistre dans les **providers**.

```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
```
✅ **Pourquoi cette organisation ?**  
- **Séparation claire** entre **Controller, Service et Repository**.  
- **Réutilisable** et **maintenable**.  

---

## **📌 Récapitulatif des Améliorations**
| **Concept**         | **Amélioration** |
|---------------------|----------------|
| **DTOs**           | Validation des entrées (`CreateUserDto`, `UpdateUserDto`). |
| **Repository**     | Encapsule les opérations MongoDB (`UserRepository`). |
| **Service**        | Contient la **logique métier**, appelle le Repository. |
| **Contrôleur**     | Utilise DTOs pour valider les entrées avant d'appeler le Service. |

---

 
