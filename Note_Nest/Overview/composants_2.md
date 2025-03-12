# Fondamentaux NestJS (docs) (3)

## Providers 

**(fournisseurs)**

Les providers sont un concept fondamental dans Nest. Beaucoup des classes de base de Nest peuvent être considérées comme des providers – services, dépôts, usines, aides, etc. 
L’idée principale d’un provider est qu’il peut être **injecté** comme dépendance ; cela signifie que les objets peuvent créer diverses relations entre eux,
et la fonction de “connecter” ces objets peut être largement déléguée au système d’exécution de Nest.

![Capture d’écran du 2025-03-11 21-26-50](https://github.com/user-attachments/assets/301c41c4-c8bf-4549-b791-c35d09509250)

![Components_1](https://github.com/user-attachments/assets/c2aa1b81-c1f3-466f-af6f-3facc95380a6)


Les contrôleurs doivent gérer les requêtes HTTP et déléguer des tâches plus complexes aux **providers**.
Les providers sont de simples classes JavaScript qui sont déclarées comme `providers` dans un module.

**Astuce** 
Puisque Nest permet de concevoir et d’organiser les dépendances d’une manière plus orientée objet, c'est recommandé vivement de suivre les principes SOLID.

### Services 

Commençons par créer un simple `CatsService`. Ce service sera responsable du stockage et de la récupération des données, et est conçu pour être utilisé par le `CatsController`, 
donc c’est un bon candidat à être défini comme un provider.

**cats.service.ts**

cats.service.ts
```
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
```

**Astuce**
Pour créer un service en utilisant la CLI, il suffit d’exécuter la commande `$ nest g service cats`.

Notre `CatsService` est une classe de base avec une propriété et deux méthodes. La seule nouvelle caractéristique est qu’elle utilise le décorateur `@Injectable()`. 
Le décorateur `@Injectable()` attache des métadonnées, qui déclarent que `CatsService` est une classe 
qui peut être gérée par le conteneur IoC de Nest. 
En passant, cet exemple utilise également une interface `Cat`, qui ressemble probablement à ceci :

**interfaces/cat.interface.ts** 

```
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```

Maintenant que nous avons une classe de service pour récupérer des chats, utilisons-la dans le `CatsController` :

**cats.controller.ts**

```
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
```

Le `CatsService` est injecté via le constructeur de classe. Noter l’utilisation de la syntaxe `private`.
Cette notation abrégée nous permet à la fois de déclarer et d’initialiser le membre `catsService` immédiatement au même endroit.

### Injection de dépendances

Nest est construit autour du modèle de conception fort communément connu sous le nom de **Injection de dépendances**. 
C'est recommandé de lire un excellent article sur ce concept dans la documentation officielle Angular. 

Dans Nest, grâce aux capacités de TypeScript, il est extrêmement facile de gérer les dépendances car elles sont résolues simplement par leur type. 
Dans l’exemple ci-dessous, Nest résoudra le `catsService` en créant et en retournant une instance de `CatsService`.

### Scopes 

Les providers ont normalement une durée de vie (“scope”) synchronisée avec le cycle de vie de l’application. 
Lorsque l’application est bootstrapée, chaque dépendance doit être résolue, et donc chaque provider doit être instancié. 
De même, lorsque l’application se ferme, chaque provider sera détruit. 
Cependant, il existe des moyens de rendre la durée de vie do provider **basée sur la requête également**. 

**! Danger !**

Si notre classe ne dérive pas d’une autre classe, nous devrions toujours préférer utiliser l’injection **basée sur le constructeur**. 
Le constructeur outline explicitement quelles dépendances sont nécessaires et fournit une meilleure visibilité que les attributs de classe annotés avec `@Inject`.

### Enregistrement des providers 

Maintenant que nous avons défini un provider (`CatsService`), et que nous avons un consommateur de ce service (`CatsController`), nous devons enregistrer le service auprès de Nest 
afin qu’il puisse effectuer l’injection. Nous faisons cela en éditant notre fichier de module (`app.module.ts`) 
et en ajoutant le service au tableau `providers` du décorateur `@Module()`.

**app.module.ts**

```
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
```
Nest sera maintenant en mesure de résoudre les dépendances de la classe `CatsController`.


