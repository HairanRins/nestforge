# Autres concepts à comprendre en microservice

---

### 1. **API Gateway**
**C'est quoi ?**
Un **point d’entrée unique** pour toutes les requêtes venant de l’extérieur vers les microservices. 
Il s’occupe de la gestion des routes, de la sécurité, de l’authentification, etc.

**Exemple :**
Tu as trois microservices : `user`, `product`, `order`. Au lieu que le client appelle chaque service séparément, 
il passe par l’API Gateway qui redirige les appels vers le bon microservice.

**Outils :**
- **Kong**
- **NGINX**
- **Express Gateway**
- **Zuul (Spring)**

---

### 2. **Service Discovery**
**C'est quoi ?**
Permet aux microservices de se **découvrir automatiquement** entre eux, surtout quand les services changent d’adresse (IP/port).

**Exemple :**
Le service `Order` a besoin d’appeler `User`. Grâce au service discovery, il n’a pas besoin de connaître l’IP exacte de `User`, juste son nom (`user-service`) et le système fait le lien.

**Outils :**
- **Consul**
- **Eureka (Spring)**
- **etcd**

---

### 3. **Communication entre services**
**C'est quoi ?**
Les microservices doivent échanger des données entre eux. Cela peut se faire :
- **De manière synchrone** (HTTP, gRPC)
- **De manière asynchrone** (RabbitMQ, Kafka)

**Exemple :**
- `order-service` appelle `product-service` via HTTP pour vérifier la disponibilité d’un produit (synchrone).
- `user-service` publie un événement "user_created" dans RabbitMQ, et `notification-service` envoie un email (asynchrone).

---

### 4. **Base de données par service**
**C'est quoi ?**
Chaque microservice a **sa propre base de données**, pour assurer **l’indépendance**.

**Exemple :**
- `user-service` → PostgreSQL
- `order-service` → MongoDB
- `inventory-service` → Redis

Cela évite le couplage entre les services.

---

### 5. **Event-Driven Architecture**
**C'est quoi ?**
Les microservices **réagissent à des événements** publiés dans un bus (RabbitMQ, Kafka). C’est une architecture orientée événements.

**Exemple :**
Quand un `User` s’inscrit, un événement `user_registered` est publié. D'autres services comme `email-service` ou `analytics-service` peuvent 
écouter et agir sans dépendre du `user-service`.

---

### 6. **Resilience & Fault Tolerance**
**C'est quoi ?**
C’est la capacité à **résister aux pannes** et à s’auto-récupérer.

**Exemple :**
- Si `product-service` est lent ou ne répond pas, `order-service` ne doit pas planter.
- Utiliser un **circuit breaker** pour éviter de surcharger un service en panne.

**Outils :**
- **Resilience4j**
- **Hystrix (déprécié)**
- **Retry, Timeout, Fallback, Circuit Breaker**

---

### 7. **Distributed Tracing**
**C'est quoi ?**
Permet de **suivre une requête à travers tous les microservices** qu’elle traverse, pour faciliter le débogage.

**Exemple :**
Une requête passe par : `API Gateway → Auth Service → Order Service → Payment Service`. Tu peux tout tracer avec un ID unique.

**Outils :**
- **Jaeger**
- **Zipkin**
- **OpenTelemetry**

---

### 8. **Centralized Logging**
**C'est quoi ?**
Toutes les logs des microservices sont **centralisées dans un seul endroit** pour mieux les analyser.

**Exemple :**
Tu centralises les logs de tous tes services dans **ELK Stack (Elasticsearch, Logstash, Kibana)**. Tu peux rechercher "user not found" et voir d’où ça vient.

---

### 9. **Configuration centralisée**
**C'est quoi ?**
Permet de gérer la configuration de tous les services à partir d’un seul endroit.

**Exemple :**
Plutôt que d’avoir des fichiers `.env` dans chaque service, tu utilises un **config server** pour fournir les variables à tous les services.

**Outils :**
- **Spring Cloud Config**
- **Consul KV**
- **Vault (pour les secrets)**

---

### 10. **Containerisation & Orchestration**
**C'est quoi ?**
Chaque microservice est **conteneurisé (Docker)** et **orchestré (Kubernetes)** pour la scalabilité, le déploiement, et la gestion.

**Exemple :**
Tu déploies ton `user-service` dans un conteneur Docker. Kubernetes s’occupe du scaling auto si la charge augmente.

**Outils :**
- **Docker**
- **Kubernetes**
- **Docker Compose (local)**

---
