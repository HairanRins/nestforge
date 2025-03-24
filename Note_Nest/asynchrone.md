# Asynchrone dans NestJS avec Promises, async/await

## Comprendre l'asynchrone dans NestJS

NestJS, étant basé sur Node.js, utilise fortement les opérations asynchrones pour gérer les E/S (accès aux bases de données, appels API externes, etc.) 
sans bloquer le thread principal.

### Concepts clés :

1. **Promises** : Objets représentant une valeur qui peut être disponible maintenant, plus tard ou jamais.
2. **async/await** : Syntaxe permettant d'écrire du code asynchrone de manière synchrone.
3. **Observables** (optionnel) : Alternative RxJS utilisable aussi dans NestJS.

## Exemples concrets

### 1. Service avec Promise basique

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class DataService {
  fetchData(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Simulation d'une opération asynchrone (DB, API, etc.)
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% de succès
        if (success) {
          resolve('Données récupérées avec succès');
        } else {
          reject(new Error('Échec de la récupération des données'));
        }
      }, 1000);
    });
  }
}
```

### 2. Utilisation avec async/await dans un contrôleur

```typescript
import { Controller, Get } from '@nestjs/common';
import { DataService } from './data.service';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get()
  async getData() {
    try {
      const data = await this.dataService.fetchData();
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
```

### 3. Service avec une opération de base de données réelle (TypeORM)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ id });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }
}
```

### 4. Contrôleur utilisant plusieurs appels asynchrones

```typescript
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.usersService.findOne(parseInt(id));
  }

  @Post()
  async createUser(@Body() userData: any) {
    const user = await this.usersService.create(userData);
    return { message: 'User created successfully', user };
  }
}
```

### 5. Exemple avec plusieurs appels parallèles

```typescript
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApiService {
  constructor(private readonly httpService: HttpService) {}

  async fetchMultipleData() {
    try {
      // Exécution en parallèle
      const [userData, productData] = await Promise.all([
        firstValueFrom(this.httpService.get('https://api.example.com/users')),
        firstValueFrom(this.httpService.get('https://api.example.com/products')),
      ]);

      return {
        users: userData.data,
        products: productData.data,
      };
    } catch (error) {
      throw new Error('Failed to fetch data from external APIs');
    }
  }
}
```

## Bonnes pratiques

1. **Toujours utiliser async/await** avec les Promises pour un code plus lisible
2. **Toujours gérer les erreurs** avec try/catch
3. **Utiliser Promise.all** pour les opérations parallèles indépendantes
4. **Annoter les types de retour** (Promise<T>) pour une meilleure maintenabilité

## Pourquoi l'asynchrone est important dans NestJS ?

- Meilleure utilisation des ressources (pas de blocage du thread principal)
- Meilleure scalabilité pour les applications I/O bound
- Compatibilité avec les bases de données et les API externes
- Fondamental pour les microservices et les architectures modernes

NestJS intègre parfaitement ces concepts, ce qui permet de construire des applications performantes et réactives.
