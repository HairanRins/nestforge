# Rabbit Concept

RabbitMQ est un **broker de messages** souvent utilisé dans les architectures **microservices** pour permettre la communication 
asynchrone entre services. Voici les concepts clés à comprendre et maîtriser, avec des exemples concrets.

---

## 1. **Concepts fondamentaux de RabbitMQ**

### 📨 1.1. **Message**
Un message est une donnée transmise entre services via RabbitMQ. Il contient :
- Un **corps** (payload, généralement JSON ou texte brut)
- Des **en-têtes** (métadonnées comme l’expéditeur, la priorité…)

> **Exemple :**  
> Un service "Commande" envoie un message avec `{ "orderId": 123, "status": "created" }` au service "Facturation".

---

### 📮 1.2. **Exchange (Échangeur)**
L’**Exchange** reçoit les messages et les oriente vers les **Queues** en fonction d’une politique de routage.

Il existe plusieurs types d’exchanges :
- **Direct** : Envoie le message à une queue spécifique basée sur une clé de routage.
- **Fanout** : Diffuse le message à toutes les queues connectées.
- **Topic** : Route en fonction d’un modèle de clé.
- **Headers** : Route selon des en-têtes de message spécifiques.

> **Exemple :**  
> Un échangeur `direct` avec une clé `order.created` envoie uniquement aux services abonnés à cette clé.

---

### 📬 1.3. **Queue (File d'attente)**
Une queue stocke les messages jusqu'à leur consommation par un service.

> **Exemple :**  
> La queue `billing-queue` stocke les messages d’ordres de paiement.

---

### 📤 1.4. **Producer (Producteur)**
Le producteur est l’application qui **publie** un message vers un exchange.

> **Exemple :**  
> Un service "Commande" envoie un message `order.created` après qu’une commande a été passée.

---

### 🎯 1.5. **Consumer (Consommateur)**
Le consommateur est une application qui **écoute** une queue et traite les messages.

> **Exemple :**  
> Le service "Facturation" écoute `billing-queue` et génère une facture pour chaque commande.

---

### 🔁 1.6. **Ack/Nack (Accusés de réception)**
- `ack` (acknowledgment) : Indique que le message a été traité avec succès.
- `nack` (negative acknowledgment) : Indique un échec, et le message peut être re-queue.

> **Exemple :**  
> Si la base de données de facturation est en panne, le service envoie un `nack`, et le message est reprogrammé.

---

## 2. **Cas pratique avec NestJS et RabbitMQ**
Prenons l’exemple d’un système où un service **Commande** notifie un service **Facturation** lorsqu’une commande est créée.

### 📌 **Installation des dépendances**
```sh
npm install --save @nestjs/microservices amqplib
```

---

### 📤 **Service Producteur (Commande)**
```typescript
import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class OrderService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'billing-queue',
        queueOptions: { durable: true },
      },
    });
  }

  createOrder(order: any) {
    console.log('Commande créée:', order);
    this.client.emit('order.created', order); // Envoi du message
  }
}
```

---

### 📬 **Service Consommateur (Facturation)**
```typescript
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class BillingService {
  @EventPattern('order.created')
  handleOrderCreated(order: any) {
    console.log('Facturation en cours pour la commande:', order);
    // Logique de facturation...
  }
}
```

---

## 3. **Meilleures pratiques avec RabbitMQ**
✅ **Utiliser des `ack` pour éviter la perte de messages.**  
✅ **Utiliser des Dead Letter Queues (DLQ)** pour gérer les messages en échec.  
✅ **Éviter les single points of failure** en ayant plusieurs consommateurs.  
✅ **Utiliser des échanges `topic`** pour des systèmes évolutifs (`order.*` pour toutes les actions de commande).  

---
