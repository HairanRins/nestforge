# Relation

En MongoDB (base de données NoSQL) et NestJS (framework Node.js), la gestion des relations comme **One-to-Many**, **Many-to-Many**, ou **One-to-One** se fait différemment que dans les bases SQL. MongoDB est **orienté document**, donc on utilise généralement **l’imbrication (embedding)** ou **la référence (referencing)** pour gérer ces relations.

Voici un guide clair avec **explications** et **exemples** pour chaque type de relation, en utilisant NestJS et Mongoose (ODM utilisé avec MongoDB dans NestJS).

---

## 1. One-to-One (1:1)

### 🔹 Cas d’usage :
Un **utilisateur** a un **profil** unique.

### ✅ Solution :
Utiliser une **référence** entre les deux documents.

### 📄 Exemple :

```ts
// profile.schema.ts
@Schema()
export class Profile {
  @Prop()
  bio: string;

  @Prop()
  avatar: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
```

```ts
// user.schema.ts
@Schema()
export class User {
  @Prop()
  username: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' })
  profile: Profile;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### 💡 Dans le service :
```ts
this.userModel.findById(userId).populate('profile');
```

---

## 2. One-to-Many (1:N)

### 🔹 Cas d’usage :
Un **utilisateur** peut avoir plusieurs **articles**.

### ✅ Deux options :
- **Référence** (plus flexible)
- **Imbrication** (performant pour petites sous-collections)

### 📄 Exemple avec **références** :

```ts
// article.schema.ts
@Schema()
export class Article {
  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: User;
}
```

```ts
// user.schema.ts
@Schema()
export class User {
  @Prop()
  username: string;
}
```

### 💡 Dans le service :
```ts
this.articleModel.find({ author: userId });
```

### 📄 Variante avec **imbrication** dans `UserSchema` (moins fréquent mais possible) :
```ts
@Prop({ type: [ArticleSchema], default: [] })
articles: Article[];
```

---

## 3. Many-to-Many (N:N)

### 🔹 Cas d’usage :
Un **utilisateur** peut aimer plusieurs **articles** et un **article** peut être aimé par plusieurs **utilisateurs**.

### ✅ Utiliser des **références croisées**.

### 📄 Exemple :

```ts
// user.schema.ts
@Schema()
export class User {
  @Prop()
  username: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Article' })
  likedArticles: Article[];
}
```

```ts
// article.schema.ts
@Schema()
export class Article {
  @Prop()
  title: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  likedBy: User[];
}
```

### 💡 Utilisation :
```ts
this.userModel.findById(userId).populate('likedArticles');
```

---

## 4. Embedding vs Referencing — Quand utiliser quoi ?

| Méthode        | Avantages | Inconvénients | À utiliser quand... |
|----------------|-----------|----------------|----------------------|
| **Imbrication** | Rapide, pas de jointures | Taille du document, duplication | Petites sous-collections peu modifiables |
| **Références** | Flexible, modulaire | Besoin de jointures (populate) | Collections séparées et dynamiques |

---

## Bonus : Population automatique avec NestJS

Dans votre module, vous pouvez injecter les modèles comme ceci :

```ts
MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
  { name: Article.name, schema: ArticleSchema },
])
```

Et dans le service :

```ts
constructor(
  @InjectModel(User.name) private userModel: Model<User>,
  @InjectModel(Article.name) private articleModel: Model<Article>,
) {}
```

---
