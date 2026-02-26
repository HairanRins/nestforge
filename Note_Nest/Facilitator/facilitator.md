# Pour la compréhension basique 

**Repository, Entité, DTO, Service : Métaphore du Restaurant**  

Imagine que tu gères un **restaurant**. Chaque élément de ton application NestJS joue un rôle précis :  

---

### **L’Entité (Entity) → La Recette du Plat**  

Dans un restaurant, chaque plat a une **recette** bien définie.  

- Par exemple, un **burger** est composé d’un pain, d’un steak, de la salade, etc.  
- La recette dit **comment structurer** le plat, mais elle ne le cuisine pas.  

L’Entité est comme une recette de cuisine, elle définit **la structure** des données (ex. : un **User** a un `id`, un `nom`, un `email`, etc.).  

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}
```

---

### **Le DTO (Data Transfer Object) → La Commande du Client**  

Quand un client commande un **burger**, il ne te dit pas **toute la recette**, mais juste ce qu’il veut :  

- Il précise : **"Un burger sans oignons, avec du fromage"**.  
- Tu prends **seulement les informations nécessaires** pour envoyer la commande en cuisine.  

Le DTO est comme une fiche de commande, il ne contient **que les infos utiles** pour transmettre les données entre l’utilisateur et l’application.  

```typescript
export class CreateUserDTO {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
```

---

### **Le Repository → Le Magasin d’Ingrédients**  

La cuisine ne va pas chercher les ingrédients **directement chez le producteur**, elle passe par un **magasin interne** où tout est stocké.  

- Si un cuisinier veut du pain, il demande au **magasin**.  
- Il ne s’occupe pas de **comment** le magasin stocke ou récupère les ingrédients, il fait juste une demande.  

Le Repository est comme un magasin interne, qui **récupère, stocke et gère les données** sans que la cuisine (service) ait besoin de gérer la base de données directement.  

```typescript
@Injectable()
export class UserRepository extends Repository<User> {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {
    super();
  }

  findByEmail(email: string): Promise<User> {
    return this.userRepo.findOne({ where: { email } });
  }
}
```

---

### **Le Service → Le Cuisinier**  

Le cuisinier reçoit la commande et utilise les ingrédients du magasin **pour préparer le plat**.  

- Il **prend la commande (DTO)**.  
- Il va chercher les ingrédients nécessaires dans le **magasin (Repository)**.  
- Il **cuisine** et prépare le plat avant de le servir.  

Le Service est comme un cuisinier, il applique la **logique métier** et gère comment les données sont traitées.  

```typescript
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userDto: CreateUserDTO): Promise<User> {
    const user = this.userRepository.create(userDto);
    return this.userRepository.save(user);
  }
}
```

---

**Résumé : Qui fait quoi ?**  

| **Concept**    | **Métaphore** | **Rôle** |
|---------------|-----------------|---------|
| **Entity**    | La recette du plat | Définit la structure des données |
| **DTO**       | La commande du client | Transporte seulement les données nécessaires |
| **Repository**| Le magasin d'ingrédients | Gère la récupération et le stockage des données |
| **Service**   | Le cuisinier | Applique la logique métier et prépare les données |

---

Avec cette image du **restaurant**, tu peux facilement comprendre comment **les composants de NestJS** travaillent ensemble pour gérer les données.
