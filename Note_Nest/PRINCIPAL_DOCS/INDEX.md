# Index des Guides NestJS

Ce document sert de point d'entrée central pour toute la documentation NestJS consolidée.

---

## **Guides Disponibles**

### **Architecture et Concepts Fondamentaux**
- **[Guide Complet NestJS](./COMPREHENSIVE_GUIDE.md)** - Architecture, modules, contrôleurs, services, et bonnes pratiques
- **[Guide des Décorateurs](./DECORATORS_COMPLETE.md)** - Tous les décorateurs NestJS avec exemples

### **Microservices**
- **[Guide Complet des Microservices](./MICROSERVICES_COMPLETE.md)** - Patterns, communication, configuration, et déploiement

### **Base de Données**
- **[NestJS + MongoDB (Mongoose)](../Nest_mongoose/template_comprehension.md)** - Configuration et utilisation
- **[DTOs et Repositories](../Facilitator/facilitator.md)** - Patterns d'accès aux données

### **OOP et TypeScript**
- **[Concepts OOP](../OOP/OOP.md)** - Encapsulation, héritage, polymorphisme
- **[Bonnes Pratiques TypeScript](../TS/best.md)** - Patterns et recommandations

### **WebSockets et Real-time**
- **[Gateways WebSocket](../Artefact/gateway.md)** - Communication temps réel
- **[Fastify Integration](../Artefact/fastify.md)** - Alternative à Express

### **HTTP et API REST**
- **[Services NestJS](../services/ServicesNest.md)** - Types et patterns de services
- **[Concepts HTTP](../Overview/composants.md)** - Contrôleurs et gestion des requêtes

### **Sécurité et Validation**
- **[Helpers Utilitaires](../Facilitator/helpers.md)** - Fonctions réutilisables
- **[Interceptors et Plugins](../Interceptors|plugins/plugins_interceptors.md)** - Middleware avancé

### **Performance et Asynchrone**
- **[Async/Await](../asynchrone.md)** - Gestion des opérations asynchrones
- **[CQRS et Event Sourcing](../command_cqrs.md)** - Patterns avancés

### **Patterns Avancés**
- **[Architecture Clean](../Architecture/note.md)** - Ports et adapters
- **[Domain-Driven Design](../Overview/fondamental.md)** - Approche par domaine
- **[Saga Pattern](../saga/SagaPattern.md)** - Gestion des transactions distribuées

---

## **Parcours Recommandé**

### **Débutant**
1. Lire le **[Guide Complet NestJS](./COMPREHENSIVE_GUIDE.md)** pour les fondamentaux
2. Comprendre les **[Concepts OOP](../OOP/OOP.md)** et **[TypeScript](../TS/best.md)**
3. Pratiquer avec les **[Services NestJS](../services/ServicesNest.md)**

### **Intermédiaire**
1. Explorer les **[Microservices](./MICROSERVICES_COMPLETE.md)**
2. Apprendre les **[WebSockets](../Artefact/gateway.md)**
3. Maîtriser la **[Base de Données](../Nest_mongoose/template_comprehension.md)**

### **Avancé**
1. Implémenter **[CQRS](../command_cqrs.md)** et **[Event Sourcing](../saga/SagaPattern.md)**
2. Utiliser l'**[Architecture Clean](../Architecture/note.md)**
3. Optimiser avec les **[Interceptors](../Interceptors|plugins/plugins_interceptors.md)**

---

## **Recherche Rapide**

### Par Cas d'Usage
- **API REST simple** → [Guide Complet](./COMPREHENSIVE_GUIDE.md) + [Services](../services/ServicesNest.md)
- **Microservices** → [Guide Microservices](./MICROSERVICES_COMPLETE.md)
- **Application temps réel** → [WebSockets](../Artefact/gateway.md) + [Async](../asynchrone.md)
- **Base de données complexe** → [MongoDB](../Nest_mongoose/template_comprehension.md) + [DTOs](../Facilitator/facilitator.md)

### Par Concept
- **Décorateurs** → [Guide Décorateurs](./DECORATORS_COMPLETE.md)
- **Architecture** → [Architecture Clean](../Architecture/note.md) + [DDD](../Overview/fondamental.md)
- **Performance** → [Async](../asynchrone.md) + [CQRS](../command_cqrs.md)
- **Sécurité** → [Helpers](../Facilitator/helpers.md) + [Interceptors](../Interceptors|plugins/plugins_interceptors.md)

---

## **Référence des Patterns**

| Pattern | Fichier Principal | Complexité |
|---------|------------------|------------|
| **CRUD Simple** | [Guide Complet](./COMPREHENSIVE_GUIDE.md) | ⭐ |
| **Service Layer** | [Services](../services/ServicesNest.md) | ⭐⭐ |
| **Repository Pattern** | [DTOs et Repositories](../Facilitator/facilitator.md) | ⭐⭐ |
| **Microservices** | [Guide Microservices](./MICROSERVICES_COMPLETE.md) | ⭐⭐⭐ |
| **Event-Driven** | [CQRS](../command_cqrs.md) | ⭐⭐⭐ |
| **Clean Architecture** | [Architecture Clean](../Architecture/note.md) | ⭐⭐⭐⭐ |
| **Domain-Driven** | [DDD](../Overview/fondamental.md) | ⭐⭐⭐⭐ |

---

## **Outils et Ressources**

### CLI Commands Utiles
```bash
# Création de module
nest generate module users

# Création de service
nest generate service users

# Création de contrôleur
nest generate controller users

# Création CRUD complet
nest generate resource users
```

### Dépendances Essentielles
```json
{
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0"
  }
}
```

---

## **Notes**

- Ce document est maintenu à jour avec les nouvelles pratiques
- Les fichiers individuels contiennent des détails approfondis
- Commencer par les guides fondamentaux avant les patterns avancés
- La pratique est essentielle pour maîtriser NestJS

---

**Dernière mise à jour :** 2025-03-18  
**Version :** 1.0.0
