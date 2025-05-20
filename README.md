# Key Consulting - Todo List Application

Cette application est une solution complète de gestion de tâches (Todo List) composée d'une API REST backend développée avec Spring Boot et d'une interface utilisateur frontend développée avec Angular.

## À propos de l'application

L'application Todo List permet de :
- Visualiser toutes les tâches
- Filtrer les tâches selon leur statut (complétées/non complétées)
- Consulter le détail d'une tâche spécifique
- Ajouter de nouvelles tâches
- Modifier le statut d'une tâche (marquer comme complétée/non complétée)

Chaque tâche est caractérisée par :
- Un identifiant unique
- Un libellé
- Une description
- Un statut (complétée ou non)

## Structure du projet

Le projet est divisé en deux parties principales :

- `todolist-back` : API REST développée avec Spring Boot
- `todolist-app` : Application frontend développée avec Angular

## Lancement du backend (API)

1. Assurez-vous d'avoir Java 17+ et Maven installés sur votre machine
2. Naviguez vers le dossier du backend :
   ```bash
   cd todolist-back
   ```
3. Compilez le projet :
   ```bash
   mvn clean install
   ```
4. Lancez l'application :
   ```bash
   mvn spring-boot:run
   ```

L'API sera disponible à l'adresse : http://localhost:8080/api/tasks

### Endpoints de l'API

- `GET /api/tasks` : Récupérer toutes les tâches
- `GET /api/tasks/incomplete` : Récupérer les tâches non complétées
- `GET /api/tasks/{id}` : Récupérer une tâche par son ID
- `POST /api/tasks` : Ajouter une nouvelle tâche
- `PATCH /api/tasks/{id}/status` : Mettre à jour le statut d'une tâche

### Documentation API avec Swagger

L'API est documentée avec Swagger, ce qui permet de visualiser et tester facilement tous les endpoints disponibles.

- Accès à Swagger UI : http://localhost:8080/swagger-ui/index.html

Pour utiliser Swagger :
1. Assurez-vous que le backend est en cours d'exécution
2. Ouvrez l'URL ci-dessus dans votre navigateur
3. Vous pouvez explorer tous les endpoints, voir leurs paramètres et les tester directement depuis l'interface

## Lancement du frontend (Angular)

1. Assurez-vous d'avoir Node.js (version 18+) et npm installés sur votre machine
2. Naviguez vers le dossier du frontend :
   ```bash
   cd todolist-app
   ```
3. Installez les dépendances :
   ```bash
   npm install
   ```
4. Lancez l'application en mode développement :
   ```bash
   ng serve
   ```

L'application sera disponible à l'adresse : http://localhost:4200

## Utilisation de l'application

1. Lancez d'abord le backend, puis le frontend
2. Accédez à l'application via http://localhost:4200
3. Vous pouvez alors :
   - Voir la liste de toutes les tâches
   - Filtrer les tâches par statut
   - Cliquer sur une tâche pour voir ses détails
   - Ajouter une nouvelle tâche via le formulaire
   - Changer le statut d'une tâche en cliquant sur la case à cocher

## Technologies utilisées

### Backend
- Java avec Spring Boot
- Maven pour la gestion des dépendances
- API REST respectant les bonnes pratiques

### Frontend
- Angular 18
- Tailwind CSS pour le styling
- Services HTTP pour communiquer avec l'API

## Notes supplémentaires

- L'API utilise une base de données en mémoire pour stocker les tâches
- L'application est responsive et peut être utilisée sur différents appareils
- Des tests unitaires ont été implémentés pour garantir la qualité du code
