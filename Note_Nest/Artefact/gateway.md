Gateway avec NestJS 

Dans NestJS, un **Gateway** (ou passerelle) est utilisé pour gérer les **communications en temps réel** via **WebSockets**, en général avec des bibliothèques comme `socket.io` ou `ws`. Cela permet de créer des applications interactives, comme des chats, des dashboards live, ou des jeux multijoueurs.

---

## Installation de base avec `socket.io`

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

---

## Fonctionnement global

* **Gateway** = point d’entrée des connexions WebSocket.
* Utilise des **décorateurs** comme `@WebSocketGateway()`, `@SubscribeMessage()`.
* Peut s’injecter dans des services Nest classiques.
* Utilise `@ConnectedSocket()` pour récupérer le client connecté.
* Utilise `@MessageBody()` pour récupérer les données envoyées.

---

## Exemple concret : Chat en temps réel

### 1. **Créer le Gateway `chat.gateway.ts`**

```ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client déconnecté : ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log(`Message reçu de ${client.id} :`, data);

    // Réémettre le message à tous les clients
    this.server.emit('message', {
      sender: client.id,
      text: data.text,
    });
  }
}
```

---

### 2. **Enregistrement dans le module `chat.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [ChatGateway],
})
export class ChatModule {}
```

---

### 3. **Côté client (Socket.io)**

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Envoi d'un message
socket.emit('message', { text: 'Hello world!' });

// Réception d'un message
socket.on('message', (msg) => {
  console.log('Message reçu :', msg);
});
```

---

## Fonctions avancées

* **Room join/leave** : permet de segmenter les clients dans des "salles".
* **Emission ciblée** :

  * `client.emit()` : vers un client spécifique
  * `this.server.to('room').emit()` : vers une salle
* **Intercepteurs/Guards** : comme pour les routes HTTP
* **Authentification par token** : middleware dans `main.ts` ou validation dans `handleConnection`.

---

## Exemple de gestion de **rooms**

```ts
@SubscribeMessage('joinRoom')
handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
  client.join(room);
  client.emit('joinedRoom', room);
}

@SubscribeMessage('sendToRoom')
handleSendToRoom(
  @MessageBody() data: { room: string; message: string },
  @ConnectedSocket() client: Socket
) {
  this.server.to(data.room).emit('message', {
    sender: client.id,
    text: data.message,
  });
}
```

---
