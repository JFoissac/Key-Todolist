# Todo List API

Une API RESTful en Java avec Spring Boot pour gérer une liste de tâches.

## Fonctionnalités

- Récupérer la liste de toutes les tâches
- Récupérer les tâches à effectuer (non complétées)
- Récupérer une tâche par son ID
- Ajouter des tâches
- Changer le statut d'une tâche

## Structure du projet

- `model`: Contient la classe `Task` qui représente une tâche
- `service`: Contient le service `TaskService` qui gère les opérations sur les tâches
- `controller`: Contient le contrôleur REST `TaskController` qui expose les endpoints de l'API

## Endpoints de l'API

- `GET /api/tasks` : Récupérer toutes les tâches
- `GET /api/tasks/incomplete` : Récupérer les tâches non complétées
- `GET /api/tasks/{id}` : Récupérer une tâche par son ID
- `POST /api/tasks` : Ajouter une nouvelle tâche
- `PATCH /api/tasks/{id}/status` : Mettre à jour le statut d'une tâche

## Modèle de données

Une tâche est représentée par les propriétés suivantes :
- `id` : l'identifiant de la tâche
- `label` : l'intitulé de la tâche
- `description` : une petite description de la tâche
- `completed` : indique si la tâche est effectuée ou non

## Démarrer l'application

```bash
# Compiler le projet
mvn clean install

# Lancer l'application
mvn spring-boot:run
```

L'API sera disponible à l'adresse : http://localhost:8080/api/tasks
