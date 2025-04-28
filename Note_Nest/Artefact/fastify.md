# Fastify dans **NestJS** 

Par défaut, **NestJS** utilise **Express** comme serveur HTTP.  
**Fastify** est une alternative plus **rapide** et **légère** à Express.

➡️ **Pourquoi utiliser Fastify avec NestJS ?**
- Il est **beaucoup plus performant** (surtout en termes de requêtes/seconde).
- Il consomme **moins de mémoire**.
- Il a une **architecture moderne** (basée sur la promesse).

**NestJS** te permet de remplacer Express par Fastify **très facilement**.

---

## Comment utiliser Fastify avec NestJS ?

1. **Installer les paquets nécessaires :**

```bash
npm install @nestjs/platform-fastify fastify
```

---

2. **Changer le "bootstrap" de ton application :**

Dans `main.ts` :

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.listen(3000);
}
bootstrap();
```

> 🔥 Ici, au lieu de `NestApplication` (Express par défaut), tu crées une `NestFastifyApplication` avec `FastifyAdapter`.

---

3. **Utilisation dans les contrôleurs :**

Rien ne change vraiment côté contrôleurs. Exemple :

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('hello')
export class HelloController {
  @Get()
  sayHello() {
    return { message: 'Hello World!' };
  }
}
```

**✅ Ça fonctionne pareil !**

---

## Attention sur certains points :

- Les **middlewares** doivent être compatibles Fastify (par exemple, `fastify-cors` au lieu d'`express-cors`).
- Les objets `Request` et `Response` sont légèrement **différents**.
- Certaines libs NestJS basées sur Express peuvent ne pas être directement compatibles (mais la plupart ont des équivalents).

Exemple : Middleware CORS avec Fastify :

```typescript
import cors from '@fastify/cors';

await app.register(cors, {
  origin: '*',
});
```

---

## Résumé visuel rapide :

| Point                     | Express (défaut) | Fastify (option) |
|----------------------------|------------------|------------------|
| Vitesse                    | Bonne            | Excellente 🚀     |
| Consommation mémoire       | Correcte          | Meilleure 🔥       |
| Facilité d'intégration     | Native            | Nécessite un `FastifyAdapter` |
| Compatibilité middlewares  | Large             | Attention à la compatibilité |
