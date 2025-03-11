# Fondamentaux NestJS (docs)

Nest tire parti des dernières fonctionnalités du langage, donc pour l’utiliser avec JavaScript pur, nous avons besoin d’un compilateur Babel.

Les contenus du src/ après création du projet 

![Capture d’écran du 2025-03-11 16-18-59](https://github.com/user-attachments/assets/f2a719ad-ef43-4844-8e16-ed980b22b340)

Le fichier `main.ts` inclut une fonction asynchrone, qui va démarrer notre application.

Création de l'instance de l'application Nest grâce à  la classe fondamentale `NestFactory`. 

Un projet généré avec le Nest CLI crée une structure de projet initiale qui encourage les développeurs à suivre la convention de garder chaque module dans son propre répertoire dédié.

Pour suivre les modifications dans vos fichiers, vous pouvez exécuter la commande suivante pour démarrer l’application :

```
$ npm run start:dev
```
Cette commande surveillera les fichiers, recompilant et rechargeant automatiquement le serveur.

### Linting et formatage 

Un projet Nest généré vient avec à la fois un linter et un formatteur préinstallés (respectivement *eslint* et *prettier*).

ESLint et Prettier sont utilisés dans un projet NestJS pour garantir un code propre et maintenable :
 * **ESLint** : Analyse statiquement le code pour détecter et corriger les erreurs et incohérences. Il impose des bonnes pratiques et un style de codage uniforme.
 * **Prettier** : Formate automatiquement le code pour assurer une mise en forme cohérente (indentation, espaces, etc.), sans affecter la logique.
 
Pour les environnements sans interface utilisateur où un IDE n’est pas pertinent (Intégration Continue, hooks Git, etc.), un projet Nest est livré avec des scripts `npm` prêts à l’emploi.

```
# Lint et correction automatique avec eslint
$ npm run lint

# Formatage avec prettier
$ npm run format
```


