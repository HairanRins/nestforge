# Helpers

En **NestJS**, les **helpers** sont des fonctions ou classes utilitaires qui permettent de centraliser des logiques réutilisables, simplifier le code, et garder les composants comme les services ou les contrôleurs plus lisibles et focalisés sur leur responsabilité métier.

---

## Pourquoi utiliser des Helpers ?
- **Réutilisabilité** : Éviter de dupliquer du code.
- **Lisibilité** : Séparer la logique technique de la logique métier.
- **Testabilité** : Les helpers sont faciles à tester unitairement.
- **Modularité** : Favorise l'architecture propre (Clean Architecture).

---

## Structure d’un helper dans NestJS

Tu peux les organiser comme ceci :

```
src/
│
├── common/
│   └── helpers/
│       ├── date.helper.ts
│       ├── string.helper.ts
│       └── file.helper.ts
```

---

## Exemple 1 : Un helper de date

**`date.helper.ts`**
```ts
export function formatDate(date: Date, locale: string = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
```

**Utilisation dans un service :**
```ts
import { formatDate } from '../common/helpers/date.helper';

@Injectable()
export class UserService {
  getUserProfile(user: User) {
    return {
      ...user,
      registeredAt: formatDate(user.createdAt),
    };
  }
}
```

---

## Exemple 2 : Génération d’un slug

**`string.helper.ts`**
```ts
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')           // espaces -> tirets
    .replace(/[^\w\-]+/g, '')       // supprime les caractères spéciaux
    .replace(/\-\-+/g, '-')         // plusieurs tirets -> un seul
    .trim();
}
```

**Utilisation dans un contrôleur ou service :**
```ts
import { generateSlug } from '../common/helpers/string.helper';

const slug = generateSlug('Titre de l’article');
```

---

## Exemple 3 : Vérifier si un fichier est une image

**`file.helper.ts`**
```ts
export function isImageFile(mimetype: string): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(mimetype);
}
```

---

## Astuce : Transformer un helper en provider injecté

Par défaut, un helper est une fonction statique ou simple. Si tu as besoin de dépendances (ex: `ConfigService`, `HttpService`), tu peux aussi créer un **helper injectable** :

```ts
@Injectable()
export class FileHelper {
  constructor(private readonly configService: ConfigService) {}

  getUploadPath(): string {
    return this.configService.get('UPLOAD_PATH') || 'uploads/';
  }
}
```

Et l’utiliser comme un service :

```ts
@Injectable()
export class UploadService {
  constructor(private readonly fileHelper: FileHelper) {}

  upload(file: Express.Multer.File) {
    const path = this.fileHelper.getUploadPath();
    // ...
  }
}
```

---
