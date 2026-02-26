**Ajout de la Recherche et de la Pagination avec un Pipeline d'Agrégation (Mongoose + NestJS)**  

Dans une API NestJS qui utilise **Mongoose**, on peut **optimiser la récupération des utilisateurs** en ajoutant :
- **Recherche** sur le nom, l'email, etc.
- **Pagination** pour limiter le nombre de résultats renvoyés.
- **Pipeline d'agrégation** si on a besoin de traitements plus avancés.

---

## **1. Modification du Repository (`user.repository.ts`)**
Nous allons créer une méthode `findWithFilters()` qui prend en charge :
- **Recherche dynamique** sur `name` et `email`.  
- **Pagination** via `page` et `limit`.  
- **Pipeline d'agrégation** si nécessaire.  

### **Implémentation du Repository**
```ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findWithFilters(
    searchQuery: string,
    page: number,
    limit: number
  ): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    
    // 1. Création du filtre de recherche
    const filter: any = {};
    if (searchQuery) {
      filter.$or = [
        { name: new RegExp(searchQuery, 'i') }, // Recherche insensible à la casse
        { email: new RegExp(searchQuery, 'i') }
      ];
    }

    // 2. Définition de la pagination
    const skip = (page - 1) * limit;

    // 3. Pipeline d'agrégation avec pagination
    const pipeline = [
      { $match: filter }, // Applique le filtre de recherche
      { $sort: { createdAt: -1 } }, // Trie par date de création (plus récent en premier)
      { $skip: skip }, // Ignore les résultats précédents pour la pagination
      { $limit: limit }, // Limite le nombre de résultats renvoyés
    ];

    // 4. Exécution du pipeline
    const users = await this.userModel.aggregate(pipeline).exec();
    const total = await this.userModel.countDocuments(filter).exec(); // Compte total d'utilisateurs trouvés

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
```

**Pourquoi ce pipeline d'agrégation ?**
- **$match** → Filtre les résultats selon la recherche.
- **$sort** → Trie les résultats par date de création (`createdAt`).
- **$skip** → Ignore les résultats des pages précédentes.
- **$limit** → Sélectionne uniquement les résultats de la page actuelle.

---

## **2. Mise à Jour du Service (`user.service.ts`)**
Dans le **Service**, on ajoute `findWithFilters()` pour appeler la méthode du Repository.

```ts
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findWithFilters(searchQuery: string, page: number, limit: number): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    return this.userRepository.findWithFilters(searchQuery, page, limit);
  }
}
```
**Pourquoi utiliser un Service ici ?**
- **Encapsule la logique métier** et permet d’ajouter des règles métier plus tard.
- **Facilite les tests unitaires**.

---

## **3. Mise à Jour du Contrôleur (`user.controller.ts`)**
Nous allons ajouter un **endpoint GET** qui accepte **query params** pour la recherche et la pagination.

```ts
import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findWithFilters(
    @Query('search') searchQuery?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    return this.userService.findWithFilters(searchQuery, Number(page), Number(limit));
  }
}
```

**Explication des paramètres :**
- `@Query('search') searchQuery?: string` → **Recherche** dynamique sur le `name` et `email`.
- `@Query('page') page = 1` → **Numéro de page** par défaut à `1`.
- `@Query('limit') limit = 10` → **Nombre max de résultats par page** par défaut à `10`.

---

## **4. Exemple d’Utilisation en API**
### **Requête GET avec Recherche et Pagination**
```http
GET /users?search=alice&page=1&limit=5
```

### **Réponse JSON**
```json
{
  "users": [
    { "id": "1", "name": "Alice Johnson", "email": "alice@mail.com" },
    { "id": "3", "name": "Alice Cooper", "email": "alice.cooper@mail.com" }
  ],
  "total": 2,
  "page": 1,
  "totalPages": 1
}
```

---

**Récapitulatif des Améliorations**
| **Amélioration**      | **Explication** |
|-----------------------|----------------|
| **Recherche avancée** | Filtre sur `name` et `email` avec une **expression régulière insensible à la casse** (`new RegExp(searchQuery, 'i')`). |
| **Pagination** | Gère **page** et **limit** pour éviter les surcharges serveur. |
| **Pipeline d'agrégation** | **Optimise** la recherche et trie les résultats. |
| **Architecture modulaire** | Séparation **Contrôleur → Service → Repository → Base de données**. |

---

## Conclusion
Avec cette implémentation :
- **On peut rechercher des utilisateurs** dynamiquement.  
- **On limite les résultats** pour améliorer la performance.  
- **L'API est scalable et efficace** grâce au pipeline d’agrégation.
