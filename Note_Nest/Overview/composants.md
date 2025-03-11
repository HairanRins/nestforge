# Fondamentaux NestJS (docs) (2)

## Contrôleurs 

Les contrôleurs sont responsables de la gestion des **requêtes** entrantes et de la renvoie des **réponses** au client. 

(img controller)

Un contrôleur a pour but de recevoir des requêtes spécifiques pour l’application. Le mécanisme de **routage** détermine quel contrôleur reçoit quelles requêtes.
Souvent, chaque contrôleur a plusieurs routes, et différentes routes peuvent exécuter différentes actions.

Pour créer un contrôleur de base, nous utilisons des classes et des **décorateurs**. 
Les décorateurs associent des classes à des métadonnées requises et permettent à Nest de créer une carte de routage (lier les requêtes aux contrôleurs correspondants).

**Astuce** : 
Pour créer rapidement un contrôleur CRUD avec la validation intégrée, vous pouvez utiliser le générateur CRUD de l’CLI : `nest g resource [name].`

### Routage 

Dans l’exemple suivant, nous utiliserons le décorateur `@Controller()`, qui est **nécessaire** pour définir un contrôleur de base. 
Nous spécifierons un préfixe de chemin routé optionnel de `cats`.
Utiliser un préfixe de chemin dans un décorateur `@Controller()` nous permet de regrouper facilement un ensemble de routes liées et de minimiser le code répétitif. 
Par exemple, nous pouvons choisir de regrouper un ensemble de routes qui gèrent les interactions avec une entité chat sous la route `/cats`.
Dans ce cas, nous pourrions spécifier le préfixe de chemin `cats` dans le décorateur `@Controller()` afin de ne pas avoir à répéter cette portion du chemin pour chaque route dans le fichier.

cats.controller.ts
``` 
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'Cette action renvoie tous les chats';
  }
}
```

**Astuce** : 
Pour créer un contrôleur à l’aide de l’CLI, exécuter simplement la commande `$ nest g controller [name]`.

Le décorateur HTTP `@Get()` avant la méthode `findAll()` indique à Nest de créer un gestionnaire pour un point de terminaison spécifique pour les requêtes HTTP. 
Le point de terminaison correspond à la méthode HTTP (GET dans ce cas) et au chemin de la route. 
 Quel est le chemin de la route ? Le chemin de la route pour un gestionnaire est déterminé en concaténant le préfixe (optionnel) déclaré pour le contrôleur 
 et tout chemin spécifié dans le décorateur de méthode.
Étant donné que nous avons déclaré un préfixe pour chaque route (`cats`), et n’avons pas ajouté d’informations de chemin dans le décorateur, 
Nest associera les requêtes `GET /cats` à ce gestionnaire. 
Comme mentionné, le chemin inclut à la fois le préfixe de chemin de contrôleur optionnel **et** toute chaîne de chemin déclarée dans le décorateur de méthode. 
 Par exemple, un préfixe de chemin `cats` combiné avec le décorateur `@Get('breed')` produirait une correspondance de route pour des requêtes comme `GET /cats/breed`.
 
Lorsqu'on utilise cette méthode, cela renverra un code d’état 200 et la réponse associée, qui dans ce cas est simplement une chaîne.

### Options pour la manipulation des réponses

Nest utilise deux options différentes pour manipuler les réponses :

(capt res)

**! Danger !**

Nest détecte quand le gestionnaire utilise `@Res()` ou `@Next()`, indiquant que vous avez choisi l’option spécifique à la bibliothèque.
Si les deux approches sont utilisées simultanément, l’approche standard est **automatiquement désactivée** pour cette route unique et ne fonctionnera plus comme prévu.

### Objectif de la requête 

Les gestionnaires ont souvent besoin d’accéder aux détails de la **requête** du client. Nest fournit un accès à l’objet de requête de la plateforme sous-jacente (Express par défaut).
Nous pouvons accéder à l’objet de requête en demandant à Nest de l’injecter en ajoutant le décorateur `@Req()` à la signature du gestionnaire.

cats.controller.ts
```
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'Cette action renvoie tous les chats';
  }
}
```

**Astuce** : 
Pour profiter des types d’**express** (comme dans l’exemple de paramètre `request: Request` ci-dessus), installer le paquet `@types/express`.

L’objet de requête représente la requête HTTP et possède des propriétés pour la chaîne de requête, les paramètres, les en-têtes HTTP et le corps de la requête.
Dans la plupart des cas, il n’est pas nécessaire de saisir ces propriétés manuellement. Nous pouvons utiliser des décorateurs dédiés à la place, 
tels que `@Body()` ou `@Query()`, qui sont disponibles par défaut. Voici une liste des décorateurs fournis :

(img capt)

### Ressources 

Auparavant, nous avons défini un point de terminaison pour récupérer la ressource des chats (route **GET**). 
Nous souhaitons généralement également fournir un point de terminaison qui crée de nouveaux enregistrements. Pour cela, créons le gestionnaire **POST** :

cats.controller.ts
```
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create(): string {
    return 'Cette action ajoute un nouveau chat';
  }

  @Get()
  findAll(): string {
    return 'Cette action renvoie tous les chats';
  }
}
```

C’est aussi simple que cela. Nest fournit des décorateurs pour toutes les méthodes HTTP standard : `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`, `@Options()`, et `@Head()`. 
De plus, `@All()` définit un point de terminaison qui gère toutes ces méthodes.

### Modèles de route avec paramètres 

Les routes avec des chemins statiques ne fonctionneront pas lorsqu' on doit accepter des données dynamiques dans la requête (par exemple, `GET /cats/1` pour obtenir le chat avec l’ID `1`).
Pour définir des routes avec des paramètres, nous pouvons ajouter des **tokens** de paramètres de route dans le chemin pour capturer la valeur dynamique à cette position dans l’URL de la requête.
Le token de paramètre de route dans l’exemple suivant montre cette utilisation. 
Les paramètres de route déclarés de cette manière peuvent être accessibles à l’aide du décorateur `@Param()`, qui doit être ajouté à la signature de la méthode.

**Astuce**
Les routes avec des paramètres doivent être déclarées après tout chemin statique. Cela empêche les chemins paramétrés d’intercepter le trafic destiné aux chemins statiques.

cats.controller.ts
```
import { Controller, Get, Param } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get(':id')
  findOne(@Param('id') id: string): string {
    return `Cette action renvoie le chat #${id}`;
  }
}
```

