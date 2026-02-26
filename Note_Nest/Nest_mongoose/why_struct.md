# DTO & repositories

En **NestJS** avec **MongoDB**, l'utilisation des **DTO** (Data Transfer Objects) et des **Repositories** 
offre plusieurs avantages en structurant l’application de manière claire et maintenable. Voici pourquoi ils sont essentiels et comment ils accompagnent une entité.

---

## **1. DTO (Data Transfer Object)**
**Pourquoi utiliser un DTO ?**
Un DTO est une classe qui définit la structure des données échangées entre le client et le serveur. Il sert à :
- **Encapsuler et valider les données** avant de les transmettre à la couche service.
- **Sécuriser l’entrée utilisateur** en définissant des règles strictes (ex. : types, validations).
- **Éviter l’exposition directe des entités** MongoDB pour plus de flexibilité et de sécurité.

**Exemple de DTO en NestJS**
Imaginons une entité `User`, voici un DTO pour créer un utilisateur :

```typescript
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly jobId?: string;
}
```
👉 Ce DTO garantit que seuls des **données valides** seront envoyées au service.

---

## **2. Repository (ou service avec Mongoose Model)**
**Pourquoi utiliser un Repository ?**
Dans NestJS, un repository (ou une couche service agissant comme un repository) permet :
- **D'encapsuler la logique d’accès aux données** et d’éviter le couplage direct avec Mongoose.
- **De centraliser les opérations CRUD** pour un meilleur contrôle et une meilleure réutilisation.
- **D’améliorer la testabilité** en simulant facilement la base de données.

**Exemple de Repository en NestJS avec Mongoose**
#### **Entité Mongoose (Schema & Document)**
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: String, ref: 'Job' })
  jobId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
```
#### **Service jouant le rôle de Repository**
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('jobId').exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).populate('jobId').exec();
  }
}
```

---

**Comment DTO et Repository accompagnent l'entité**
| Élément | Rôle |
|---------|------|
| **Entité (`User`)** | Modèle représentant la structure des données MongoDB. |
| **DTO (`CreateUserDto`)** | Valide et contrôle les données entrantes avant de les persister. |
| **Repository (`UserService`)** | Gère l'accès et la manipulation des données dans la base MongoDB. |

**Flux global :**
1. Une requête HTTP arrive dans un **contrôleur** (`UserController`).
2. Le contrôleur valide la requête avec le **DTO** (`CreateUserDto`).
3. Les données validées sont transmises au **repository/service** (`UserService`).
4. Le service interagit avec l’entité (`User`) via Mongoose.
5. La réponse est renvoyée au client.

---

**Conclusion**
L’utilisation des **DTO** et des **Repositories** en NestJS avec MongoDB :
**Sécurise et valide** les données avant qu'elles atteignent la base.  
**Sépare les responsabilités**, rendant l'application plus lisible et maintenable.  
**Facilite les tests unitaires** en permettant le mock du repository.
