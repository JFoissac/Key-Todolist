package com.todolist.service;

import com.todolist.model.Task;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service pour gérer les opérations sur les tâches
 */
@Service
public class TaskService {

    // Données en mémoire pour simuler une base de données
    private List<Task> tasks = new ArrayList<>() {{
        add(new Task(1L, "Faire les courses", "Acheter du pain et du lait", Task.STATUS_PENDING));
        add(new Task(2L, "Appeler le médecin", "Prendre rendez-vous pour la semaine prochaine", Task.STATUS_COMPLETED));
        add(new Task(3L, "Réviser pour l'examen", "Chapitres 1 à 5", Task.STATUS_PENDING));
        add(new Task(4L, "Faire du sport", "30 minutes de jogging", Task.STATUS_PENDING));
    }};
    private Long nextId = 5L;

    /**
     * Récupère toutes les tâches
     * @return Liste de toutes les tâches
     */
    public List<Task> getAllTasks() {
        return new ArrayList<>(tasks);
    }

    /**
     * Récupère toutes les tâches non complétées
     * @return Liste des tâches à effectuer
     */
    public List<Task> getIncompleteTasks() {
        return tasks.stream()
                .filter(task -> !Task.STATUS_COMPLETED.equals(task.getStatus()) && 
                         !Task.STATUS_CANCELLED.equals(task.getStatus()))
                .collect(Collectors.toList());
    }

    /**
     * Récupère une tâche par son ID
     * @param id ID de la tâche
     * @return Tâche correspondante ou vide si non trouvée
     */
    public Optional<Task> getTaskById(Long id) {
        return tasks.stream()
                .filter(task -> task.getId().equals(id))
                .findFirst();
    }

    /**
     * Ajoute une nouvelle tâche
     * @param task Tâche à ajouter (sans ID)
     * @return Tâche ajoutée avec son ID
     */
    public Task addTask(Task task) {
        task.setId(nextId++);
        tasks.add(task);
        return task;
    }

    /**
     * Met à jour le statut d'une tâche
     * @param id ID de la tâche
     * @param status Nouveau statut (pending, in-progress, completed, cancelled)
     * @return Tâche mise à jour ou vide si non trouvée
     */
    public Optional<Task> updateTaskStatus(Long id, String status) {
        Optional<Task> taskOpt = getTaskById(id);
        taskOpt.ifPresent(task -> task.setStatus(status));
        return taskOpt;
    }

    /**
     * Méthode de compatibilité pour maintenir la rétro-compatibilité
     * @param id ID de la tâche
     * @param completed Nouveau statut sous forme de booléen
     * @return Tâche mise à jour ou vide si non trouvée
     */
    @Deprecated(since = "1.0.0", forRemoval = true)
    public Optional<Task> updateTaskCompletionStatus(Long id, boolean completed) {
        Optional<Task> taskOpt = getTaskById(id);
        taskOpt.ifPresent(task -> {
            String newStatus = completed ? Task.STATUS_COMPLETED : Task.STATUS_PENDING;
            task.setStatus(newStatus);
        });
        return taskOpt;
    }

    /**
     * Met à jour une tâche existante
     * @param id Identifiant de la tâche
     * @param updatedTask Nouvelles données de la tâche
     * @return La tâche mise à jour, ou vide si non trouvée
     */
    public Optional<Task> updateTask(Long id, Task updatedTask) {
        Optional<Task> taskOpt = getTaskById(id);
        
        taskOpt.ifPresent(task -> {
            task.setLabel(updatedTask.getLabel());
            task.setDescription(updatedTask.getDescription());
            task.setStatus(updatedTask.getStatus());
            // Mettre à jour d'autres propriétés au besoin
            if (updatedTask.getDueDate() != null) {
                task.setDueDate(updatedTask.getDueDate());
            }
            
            if (updatedTask.getPriority() != null) {
                task.setPriority(updatedTask.getPriority());
            }
            
            if (updatedTask.getPomodoroCount() != null) {
                task.setPomodoroCount(updatedTask.getPomodoroCount());
            }
            
            // La date de mise à jour est automatiquement gérée par les setters
        });
        
        return taskOpt;
    }
    
    /**
     * Supprime une tâche par son ID
     * @param id ID de la tâche à supprimer
     * @return true si la tâche a été supprimée, false si elle n'a pas été trouvée
     */
    public boolean deleteTask(Long id) {
        Optional<Task> taskOpt = getTaskById(id);
        if (taskOpt.isPresent()) {
            tasks.removeIf(task -> task.getId().equals(id));
            return true;
        }
        return false;
    }
}
