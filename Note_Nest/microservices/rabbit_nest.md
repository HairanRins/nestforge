# La **logique de communication inter-services avec RabbitMQ dans NestJS** — et les notions `emit`, `send`, `@MessagePattern`, `@EventPattern` sont **au cœur du système de microservices** de Nest.

Voici une **explication claire, structurée et concrète** 

---

##  1. Les deux modes de communication dans NestJS microservices

| Type                 | Description                                                                      | Exemple typique                    | Méthode utilisée               |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------ |
| **Request/Response** | Communication **synchronisée** : on envoie une requête et on attend une réponse  | Demande de données (`getUserById`) | `send()` + `@MessagePattern()` |
| **Event-driven**     | Communication **asynchrone** : on **émet un événement** sans attendre de réponse | Notification, création, logs, etc. | `emit()` + `@EventPattern()`   |

---

##  2. Mise en place d’un microservice RabbitMQ

Dans ton **main.ts**, côté service :

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'user_queue',
      queueOptions: { durable: false },
    },
  });

  await app.listen();
  console.log('Microservice user_queue is running');
}
bootstrap();
```

---

## 3. `@MessagePattern()` → avec `send()`

### Principe

* Le **client** envoie une **demande** (`send`).
* Le **serveur** traite et **retourne une réponse** (`@MessagePattern`).

C’est une **communication à double sens**.

### Exemple côté **client**

```ts
// client.service.ts
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class ClientService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'user_queue',
        queueOptions: { durable: false },
      },
    });
  }

  async getUserData(id: string) {
    return this.client.send({ cmd: 'get_user' }, { id }).toPromise();
  }
}
```

### Exemple côté **serveur**

```ts
// user.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class UserController {
  @MessagePattern({ cmd: 'get_user' })
  getUser(data: { id: string }) {
    console.log('Requête reçue :', data);
    return { id: data.id, name: 'Alice', email: 'alice@example.com' };
  }
}
```

**→ Le client reçoit une réponse directe.**

---

## 4. `@EventPattern()` → avec `emit()`

### Principe

* Le **client** envoie un **événement** (pas de réponse attendue).
* Le **serveur** le **reçoit et exécute une action** (logique métier, enregistrement, etc.).

C’est une **communication unidirectionnelle**.

### Exemple côté **client**

```ts
// client.service.ts
import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class ClientService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'notification_queue',
        queueOptions: { durable: false },
      },
    });
  }

  emitUserCreated(user: any) {
    this.client.emit('user_created', user);
  }
}
```

### Exemple côté **serveur**

```ts
// notification.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class NotificationController {
  @EventPattern('user_created')
  handleUserCreated(user: any) {
    console.log('Nouvel utilisateur créé :', user);
    // Logique : envoyer un email, enregistrer, etc.
  }
}
```

 → Aucune réponse n’est renvoyée au client.

---

## 5. Résumé des différences

| Critère            | `send()` + `@MessagePattern()`           | `emit()` + `@EventPattern()`        |
| ------------------ | ---------------------------------------- | ----------------------------------- |
| Type               | Requête / Réponse                        | Événement                           |
| Sens               | Bidirectionnel                           | Unidirectionnel                     |
| Attente de réponse | Oui                                      | Non                                 |
| Usage typique      | Lecture / requête de données             | Notification / création / log       |
| Exemple            | `client.send({ cmd: 'get_user' }, data)` | `client.emit('user_created', data)` |

---

## 6. Exemple global d’architecture

```
+---------------------+
|  Auth Service       |
|---------------------|
| emit('user_created')|
+---------+-----------+
          |
          v
+-----------------------+
| Notification Service  |
|-----------------------|
| @EventPattern('user_created') |
+-----------------------+

(Parallèlement)

+-----------------------+
| User Service          |
|-----------------------|
| @MessagePattern({cmd:'get_user'}) |
+-----------------------+
```

---

**Bonne pratiques**

- Définir des **queues** claires et légères
- Préfixer les commandes : `user.created`, `order.paid`, etc.
- Gérer les erreurs (`try/catch`) côté consumer
- Utiliser `.toPromise()` pour `send()` si besoin d’attendre la réponse
- Toujours démarrer le microservice Rabbit avant d’émettre

---
