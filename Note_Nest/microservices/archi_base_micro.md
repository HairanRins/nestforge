# Un peu de microservices

Pour comprendre le fonctionnement technique de l'architecture que vous décrive, nous allons décomposer chaque composant et expliquer son rôle, ainsi que les interactions entre eux. Cette architecture est typique d'une application moderne basée sur des microservices, avec une gestion des requêtes via une API Gateway, une communication asynchrone via RabbitMQ, une gestion des transactions distribuées via les patterns Saga, une mise en cache avec Redis, une base de données MongoDB, et un backend développé avec NestJS.

---

### 1. **Microservices**
Les microservices sont une approche architecturale où une application est divisée en plusieurs petits services indépendants, chacun ayant une responsabilité spécifique (par exemple, gestion des utilisateurs, gestion des commandes, etc.). Chaque microservice :
- Est autonome et peut être développé, déployé et mis à jour indépendamment.
- Possède sa propre base de données (éventuellement MongoDB dans ce cas).
- Communique avec d'autres microservices via des APIs ou des messages asynchrones (via RabbitMQ).

---

### 2. **API Gateway**
L'API Gateway est un point d'entrée unique pour toutes les requêtes provenant du frontend (ou d'autres clients). Son rôle est de :
- **Router les requêtes** vers les microservices appropriés.
- **Agréger les réponses** de plusieurs microservices si nécessaire.
- **Gérer l'authentification et l'autorisation** (par exemple, vérifier les tokens JWT).
- **Cache des réponses** (éventuellement avec Redis) pour améliorer les performances.
- **Gérer les erreurs** et fournir une réponse cohérente au client.

---

### 3. **RabbitMQ**
RabbitMQ est un système de messagerie asynchrone (message broker) qui permet aux microservices de communiquer entre eux de manière découplée. Par exemple :
- Un microservice peut publier un message dans une file d'attente (queue) RabbitMQ.
- Un autre microservice peut consommer ce message et effectuer une action en conséquence.
- Cela est particulièrement utile pour les opérations asynchrones ou pour implémenter des patterns comme Saga.

---

### 4. **Saga Patterns (Orchestration et Choreography)**
Les Sagas sont utilisées pour gérer des transactions distribuées dans un environnement de microservices, où chaque service a sa propre base de données. Il existe deux approches principales :

#### a. **Saga Orchestrée (Orchestration)**
- Un orchestrateur central (souvent un service dédié) contrôle le flux des opérations.
- L'orchestrateur envoie des commandes aux microservices et gère les compensations en cas d'échec.
- Exemple avec 3 étapes :
  1. L'orchestrateur demande au Service A d'effectuer une opération.
  2. Si l'opération réussit, il demande au Service B d'effectuer une autre opération.
  3. Si une opération échoue, l'orchestrateur déclenche des actions de compensation pour annuler les opérations précédentes.

#### b. **Saga Chorégraphiée (Choreography)**
- Chaque microservice écoute les événements publiés par d'autres microservices et réagit en conséquence.
- Il n'y a pas d'orchestrateur central ; les microservices collaborent via des événements.
- Exemple avec 3 étapes :
  1. Le Service A publie un événement "Opération A réussie".
  2. Le Service B écoute cet événement et effectue une opération, puis publie "Opération B réussie".
  3. Si une opération échoue, chaque service déclenche sa propre compensation.

---

### 5. **Mise en cache avec Redis**
Redis est une base de données en mémoire utilisée pour la mise en cache. Dans cette architecture :
- L'API Gateway ou les microservices peuvent utiliser Redis pour stocker des données fréquemment consultées (par exemple, des informations utilisateur ou des résultats de requêtes coûteuses).
- Cela réduit la charge sur les bases de données principales (comme MongoDB) et améliore les performances globales.

---

### 6. **Base de données MongoDB**
MongoDB est une base de données NoSQL orientée documents. Dans cette architecture :
- Chaque microservice peut avoir sa propre instance de MongoDB pour stocker ses données.
- MongoDB est choisi pour sa flexibilité et sa capacité à gérer des données semi-structurées.

---

### 7. **Backend avec NestJS**
NestJS est un framework Node.js pour construire des applications backend. Dans cette architecture :
- Les microservices sont développés avec NestJS, qui fournit des outils pour créer des APIs RESTful, des contrôleurs, des services, et des modules.
- NestJS supporte également la communication asynchrone (via RabbitMQ) et l'intégration avec des bases de données comme MongoDB.

---

### 8. **Frontend et flux des requêtes**
Le frontend interagit avec l'architecture via l'API Gateway. Voici le flux typique d'une requête :
1. Le frontend envoie une requête à l'API Gateway.
2. L'API Gateway authentifie la requête et la route vers l'orchestrateur (pour les opérations complexes) ou directement vers un microservice.
3. Si une saga est nécessaire, l'orchestrateur coordonne les microservices via des commandes ou des événements.
4. Les microservices communiquent entre eux via RabbitMQ si nécessaire.
5. Les réponses sont renvoyées à l'API Gateway, qui les agrége et les renvoie au frontend.

---

### Diagramme simplifié du flux
```
Frontend -> API Gateway -> Orchestrateur -> Microservices (NestJS) -> RabbitMQ -> MongoDB
                                  |
                                  v
                                Redis (cache)
```

---

### Avantages de cette architecture
- **Scalabilité** : Chaque microservice peut être mis à l'échelle indépendamment.
- **Découplage** : Les services sont indépendants, ce qui facilite la maintenance et les mises à jour.
- **Résilience** : Les Sagas et RabbitMQ aident à gérer les erreurs et les transactions distribuées.
- **Performance** : Redis et l'API Gateway améliorent les temps de réponse.

### Inconvénients
- **Complexité** : La gestion des transactions distribuées et la communication asynchrone augmentent la complexité.
- **Latence** : Les appels entre microservices peuvent introduire de la latence.
- **Surveillance** : Il est nécessaire de surveiller chaque composant pour garantir la performance et la disponibilité.

---

En résumé, cette architecture est puissante et flexible, mais elle nécessite une bonne planification et une gestion rigoureuse pour tirer pleinement parti de ses avantages.
