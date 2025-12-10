# Surplus en connaissance

Dans NestJS, le mot-clé `bind` intervient dans deux contextes très différents :  

1. **liaison d’une méthode (JavaScript classique)** ;  
2. **liaison d’injection de dépendance via le décorateur `@Bind` (NestJS)**.  

Ci-dessous, on détaille chaque cas et on montre comment ils se combinent avec la notion de « use-case » quand on veut appliquer une Clean Architecture.

---

### 1. Method binding : garder le `this` correct

Problème : dès qu’on passe une méthode de classe en callback (`setInterval`, écouteur d’événement, middleware, etc.), le `this` est perdu.

```ts
@Injectable()
export class MyService {
  private count = 0;

  increment() {          // méthode « normale »
    this.count++;        // <- ici `this` dépend de l’appelant
  }

  start() {
    setInterval(this.increment, 1000); // ❌ `this` undefined
  }
}
```

Deux solutions Nest-friendly :

a) **Arrow function** (la plus courte)  
```ts
increment = () => { this.count++; };
```

b) **bind(this)** explicite  
```ts
start() {
  setInterval(this.increment.bind(this), 1000);
}
```

Quand on construit des use-cases sous forme de classes, on retrouve le même souci si on veut passer une méthode `execute` en callback :

```ts
export class CreateUserUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    return this.userRepo.save(dto);   // <- `this` nécessaire
  }
}

// dans le controller
@Post()
create(@Body() dto: CreateUserDto) {
  // on garantit le `this` :
  return this.createUserUC.execute.bind(this.createUserUC)(dto);
}
```

On préfère souvent l’arrow-function dans la déclaration de la méthode `execute` pour éviter ces `.bind` répétés .

---

### 2. Le décorateur `@Bind` de NestJS (injection sans TypeScript)

Nest permet d’écrire des controllers en **vanilla JavaScript** ou quand on ne veut pas utiliser la syntaxe `constructor(private srv: Service)`.

```ts
import { Controller, Get, Bind, Dependencies } from '@nestjs/common';
import { CatsService } from './cats.service';

@Controller('cats')
@Dependencies(CatsService)          // <-- indique au conteneur ce qu’il doit injecter
export class CatsController {
  constructor(catsService) {        // pas de type, juste JS
    this.catsService = catsService;
  }

  @Get()
  @Bind()                          // <-- équivalent « décorateur vide »
  async findAll() {
    return this.catsService.findAll();
  }
}
```

`@Bind()` seul ne sert presque jamais ; on l’utilise plutôt pour **mapper les paramètres décorés** :

```ts
@Post()
@Bind(Body())                      // équivalent de @Body()
async create(createCatDto) {
  this.catsService.create(createCatDto);
}
```

En TypeScript, on n’a pas besoin de `@Bind` car les décorateurs de paramètres (`@Body`, `@Param`, etc.) font déjà le travail .

---

### 3. Use-case, Clean Architecture et injection

Dans une Clean Architecture, un « use-case » est une classe pure qui orchestre la logique métier.  
Exemple :

```ts
// core/use-cases/create-product.use-case.ts
export class CreateProductUseCase {
  constructor(private productRepo: ProductRepository) {}

  async execute(cmd: CreateProductCommand): Promise<Product> {
    // règles métier ici
    const p = new Product(cmd.name, cmd.price);
    return this.productRepo.save(p);
  }
}
```

Pour que NestJS injecte le repo, on déclare le use-case comme provider :

```ts
@Injectable()
export class CreateProductUseCase { ... }
```

puis

```ts
@Module({
  providers: [CreateProductUseCase, ProductRepository],
  exports:   [CreateProductUseCase]
})
export class ProductModule {}
```

Le controller ne dépend que du use-case :

```ts
@Controller('products')
export class ProductController {
  constructor(private createUC: CreateProductUseCase) {}

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.createUC.execute(dto);
  }
}
```

Ainsi :  
- le `bind` JavaScript (ou l’arrow-function) garantit que la méthode `execute` garde son `this` quand on la transmet ;  
- le décorateur `@Bind` NestJS n’est utile que si vous écrivez sans TypeScript ;  
- les use-cases restent découplés des détails techniques (HTTP, ORM, etc.) et bénéficient pleinement du système d’injection de NestJS .

---

### 4. Bonnes pratiques récapitulatives

| Situation | Solution recommandée |
|-----------|----------------------|
| Perte du `this` dans un callback | Arrow-function ou `.bind(this)` |
| Ecriture JS sans types | `@Dependencies(…)` + `@Bind(Body())` |
| Use-case / Clean Architecture | Classe `@Injectable()` + injection via constructeur |
| Test unitaire | Injection = mock facile : `const uc = new CreateProductUseCase(mockRepo)` |

---

En résumé, le « bind » classique sert à préserver le contexte (`this`) des méthodes de vos use-cases ou services, tandis que le décorateur `@Bind` est un équivalent JS pur des décorateurs de paramètres Nest. Combinez les deux permet de bâtir des applications modulaires, 
testables et conformes aux principes de la Clean Architecture dans l’écosystème NestJS.
