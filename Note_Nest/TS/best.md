En TypeScript, il y a plusieurs aspects à maîtriser, tant sur le plan logique que sur les bonnes pratiques de développement. Voici un guide des **logiques**, **comportements**, **prises en main** et **attitudes** à adopter en TypeScript.  

---

## **1. Logiques et Compréhensions en TypeScript**
### 1.1 **Comprendre le Typage Fort**
TypeScript est un surensemble de JavaScript qui ajoute le typage statique. Cela signifie que chaque variable, paramètre ou retour de fonction peut être défini avec un type spécifique.

Exemple :
```typescript
let age: number = 25;  // Correct
age = "trente";        // ❌ Erreur : Type 'string' is not assignable to type 'number'
```
L'intérêt principal est d'éviter les erreurs au moment de la compilation et d'améliorer la lisibilité du code.

---

### 1.2 **Utiliser les Types et Interfaces**
Les **types** et **interfaces** permettent de structurer et mieux organiser le code.

#### **Exemple avec un `type`**
```typescript
type User = {
  id: number;
  name: string;
  isAdmin: boolean;
};
```

#### **Exemple avec une `interface`**
```typescript
interface User {
  id: number;
  name: string;
  isAdmin: boolean;
}
```
Les interfaces sont extensibles :
```typescript
interface Admin extends User {
  permissions: string[];
}
```

**Bonne pratique** : utiliser `interface` pour les objets et `type` pour les unions et alias.

---

### 1.3 **Comprendre l'Union et l'Intersection**
TypeScript permet de combiner plusieurs types avec des unions (`|`) et des intersections (`&`).

```typescript
type Status = "active" | "inactive" | "suspended"; // Union
type AdminUser = User & { permissions: string[] }; // Intersection
```

---

### 1.4 **Utiliser les Génériques pour un Code Flexible**
Les **génériques** permettent de rendre les fonctions et classes plus réutilisables.

```typescript
function identity<T>(value: T): T {
  return value;
}

let num = identity<number>(42);
let str = identity<string>("Hello");
```
---

## **2. Prise en Main et Outils**
### 2.1 **Installation de TypeScript**
Si ce n'est pas encore fait :
```bash
npm install -g typescript
tsc --version
```

---

### 2.2 **Configurer `tsconfig.json`**
Créer un fichier `tsconfig.json` pour gérer les options de compilation :
```json
{
  "compilerOptions": {
    "target": "ES6",
    "strict": true,
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```
Utiliser `tsc` pour compiler :
```bash
tsc
```

---

### 2.3 **Utiliser ESLint et Prettier**
Un bon workflow inclut ESLint pour le linting et Prettier pour le formatage :
```bash
npm install eslint prettier eslint-config-prettier eslint-plugin-prettier --save-dev
```

Créer `.eslintrc.json` :
```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"]
}
```

---

## **3. Attitudes à Adopter**
### **3.1 Éviter `any` Autant que Possible**
Laisser TypeScript inférer les types ou utiliser des types précis.
```typescript
let user: any;  // ❌ Mauvaise pratique
let user: string; // ✅ Bonne pratique
```

---

### **3.2 Préférer `const` et `readonly`**
```typescript
const PI = 3.14; // ✅ Evite les réaffectations
readonly name: string; // ✅ Empêche la modification d'une propriété
```

---

### **3.3 Utiliser `unknown` Plutôt que `any`**
```typescript
let data: unknown; // ✅ Plus sécurisé que `any`
data = "Hello";
if (typeof data === "string") {
  console.log(data.toUpperCase());
}
```

---

### **3.4 Favoriser l'Immutabilité**
Éviter de modifier directement des objets.
```typescript
const user = { name: "Alice", age: 30 };
const newUser = { ...user, age: 31 }; // ✅ Immutabilité respectée
```

---

### **3.5 Faire Attention aux `null` et `undefined`**
Activer `strictNullChecks` dans `tsconfig.json` :
```json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```
---

## **4. Bonnes Pratiques et Routines**
- **Documenter son code** avec JSDoc  
- **Utiliser des DTOs (Data Transfer Objects)** pour valider les données  
- **Écrire des tests unitaires** avec Jest  
- **Se former continuellement** : TypeScript évolue régulièrement  

---

En appliquant ces concepts, tu seras plus efficace et produiras un code robuste et lisible en TypeScript.
