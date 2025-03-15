# Saga Pattern

C'est un modèle de gestion des transactions distribuées utilisé dans les architectures **microservices**.
Il permet de gérer la cohérence des données sans utiliser une transaction ACID unique, en orchestrant une série d’étapes compensables.

## 1. Deux approches du Saga Pattern

Il existe deux principales implémentations du **Saga Pattern** :

1. **Orchestration-Based Saga** (*Saga orchestrée*)
    * Un **orchestrateur** (comme **NestJS** avec `@nestjs/cqrs` ou **Camunda**) gère la coordination des étapes.
    * Chaque service effectue une action et en informe l’orchestrateur.
    
2. **Choreography-Based Saga** (*Saga chorégraphiée*)
    * Chaque service écoute les événements d’un bus de messages (RabbitMQ, Kafka) et déclenche ses propres actions.
    * Pas d'orchestrateur central, chaque service est autonome. 
    


