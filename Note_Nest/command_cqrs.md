# Command Design Pattern

En NestJS, la **création de commandes** fait généralement référence à l’utilisation de **Command Design Pattern** ou à des **Commandes CLI personnalisées**, selon le contexte. Voici les deux principales utilisations :

---

## 1. **Command Pattern (via `@CommandHandler`) — CQRS**

### Pourquoi utiliser des commandes (Command Pattern) ?

Quand tu utilises **CQRS (Command Query Responsibility Segregation)** dans NestJS, tu sépares :

- Les **Commandes** (modification de données)
- Des **Requêtes** (lecture de données)

Cela permet une architecture plus claire, maintenable et testable, surtout dans les systèmes complexes.

---

### Exemple :

Imaginons une application de gestion d'utilisateurs. Tu veux créer un utilisateur :

#### Étape 1 : Créer la commande

```ts
// create-user.command.ts
export class CreateUserCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
  ) {}
}
```

#### Étape 2 : Créer le handler

```ts
// create-user.handler.ts
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserCommand } from "./create-user.command";

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: CreateUserCommand): Promise<void> {
    const { name, email } = command;
    await this.userService.createUser(name, email);
  }
}
```

#### Étape 3 : Utiliser dans un service ou contrôleur

```ts
// user.controller.ts
@Post()
async create(@Body() dto: CreateUserDto) {
  await this.commandBus.execute(new CreateUserCommand(dto.name, dto.email));
}
```

#### Étape 4 : Enregistrer le handler dans le module

```ts
// user.module.ts
import { CqrsModule } from "@nestjs/cqrs";
import { CreateUserHandler } from "./commands/create-user.handler";

@Module({
  imports: [CqrsModule],
  providers: [CreateUserHandler],
})
export class UserModule {}
```

---

### Avantages :

- Séparation des responsabilités
- Architecture plus scalable
- Facilité pour les événements, validations, logs, tests unitaires

---

## 2. **Commandes CLI personnalisées (via `@Command`)**

### Pourquoi faire des commandes CLI ?

Tu peux créer des commandes **que tu exécutes depuis le terminal**, pour :

- Initialiser des données
- Faire des scripts d'import/export
- Générer des rapports
- Automatiser certaines tâches

---

### Exemple avec `nestjs-command`

#### Étape 1 : Installer le package

```bash
npm install nestjs-command
```

#### Étape 2 : Créer une commande

```ts
// seed.command.ts
import { Command } from "nestjs-command";
import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";

@Injectable()
export class SeedCommand {
  constructor(private readonly userService: UserService) {}

  @Command({ command: "seed:users", describe: "Seed default users" })
  async seed() {
    await this.userService.createUser("Admin", "admin@example.com");
    console.log("Users seeded!");
  }
}
```

#### Étape 3 : Enregistrer dans un module

```ts
@Module({
  providers: [SeedCommand],
})
export class CommandModule {}
```

#### Étape 4 : Ajouter dans `main.ts`

```ts
import { CommandModule, CommandService } from "nestjs-command";

@Module({
  imports: [CommandModule, UserModule],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.get(CommandService).exec();
  await app.close();
}
bootstrap();
```

#### Exécuter la commande

```bash
npx ts-node src/main.ts seed:users
```

---

## Résumé :

| Type                     | Utilisation                           | Exemple             |
| ------------------------ | ------------------------------------- | ------------------- |
| `@CommandHandler` (CQRS) | Modifications métier via des handlers | `CreateUserCommand` |
| `@Command` (CLI)         | Scripts exécutables via terminal      | `seed:users`        |

---
