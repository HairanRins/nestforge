# Listeners

### Pourquoi utiliser des **listeners** avec NestJS ?

1. **Découpler les composants**  
   → Les listeners permettent de réagir à des événements **sans** que les émetteurs (ceux qui déclenchent l'événement) sachent **qui** va écouter.  
   ➔ Ça réduit les dépendances directes entre tes services.

2. **Gestion d'actions asynchrones**  
   → Tu peux traiter certains comportements **en parallèle** du flux principal (exemple : envoyer un email après inscription, sans bloquer la réponse HTTP).

3. **Architecture événementielle**  
   → Dans des projets complexes (ex : microservices, gros monolithes modulaires), tout repose sur des événements pour **mieux organiser** les échanges entre modules.

4. **Meilleure maintenance**  
   → Quand tu ajoutes une nouvelle action à un événement, **pas besoin de modifier le code existant**. Tu ajoutes juste un nouveau listener.

5. **Scalabilité**  
   → C’est très pratique dans des systèmes **distribués** ou **microservices** où les événements peuvent être propagés entre différentes instances ou applications.

---

### Usages concrets de listeners dans NestJS

| Cas pratique | Exemple d'événement | Exemple d'action (listener) |
|:------------|:--------------------|:----------------------------|
| Authentification | `user.registered` | Envoi d'un email de bienvenue |
| Commande | `order.paid` | Génération d'une facture PDF |
| Monitoring | `user.logged_in` | Envoi des infos de connexion à un système d'analyse |
| Notifications | `comment.added` | Envoyer une notification en temps réel via WebSocket |
| Gestion interne | `task.failed` | Log des erreurs ou relancer la tâche automatiquement |

---

### Comment c'est fait dans NestJS ?

Dans NestJS, pour utiliser des listeners, tu passes souvent par :

- **`@EventPattern`** et **`@MessagePattern`** avec **microservices** (Kafka, RabbitMQ, etc.)
- Ou via une logique interne avec **`EventEmitterModule`**.

**Exemple rapide avec `EventEmitterModule`** :
```typescript
// Installation
npm install @nestjs/event-emitter
```

**1. Configuration**
```typescript
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
})
export class AppModule {}
```

**2. Emetteur (Publisher)**
```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
  constructor(private eventEmitter: EventEmitter2) {}

  async createUser(userData: any) {
    // Créer utilisateur...
    this.eventEmitter.emit('user.created', { userId: 123 });
  }
}
```

**3. Listener (Abonné)**
```typescript
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserListener {
  @OnEvent('user.created')
  handleUserCreatedEvent(payload: any) {
    console.log('User created with ID:', payload.userId);
    // Envoi de mail, log, etc.
  }
}
```

---

### En résumé
> Les listeners avec NestJS sont **essentiels** pour construire des applications **modulaires, propres et évolutives**.  
> Ils permettent de **réagir** à des événements **sans casser l’architecture** du projet.

---
