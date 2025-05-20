package com.todolist.service;

import com.todolist.model.Task;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @InjectMocks
    private TaskService taskService;

    @BeforeEach
    void setUp() {
        // Réinitialiser le service avant chaque test
        taskService = new TaskService();
    }

    @Test
    void getAllTasks_shouldReturnAllTasks() {
        // When
        List<Task> tasks = taskService.getAllTasks();
        
        // Then
        assertEquals(4, tasks.size());
        assertEquals("Faire les courses", tasks.get(0).getLabel());
        assertEquals("Appeler le médecin", tasks.get(1).getLabel());
        assertEquals("Réviser pour l'examen", tasks.get(2).getLabel());
        assertEquals("Faire du sport", tasks.get(3).getLabel());
    }

    @Test
    void getIncompleteTasks_shouldReturnOnlyIncompleteTasks() {
        // When
        List<Task> incompleteTasks = taskService.getIncompleteTasks();
        
        // Then
        assertEquals(3, incompleteTasks.size());
        for (Task task : incompleteTasks) {
            assertFalse(task.isCompleted());
        }
        // Vérifier que la tâche complétée n'est pas dans la liste
        assertTrue(incompleteTasks.stream().noneMatch(task -> "Appeler le médecin".equals(task.getLabel())));
    }

    @Test
    void getTaskById_withExistingId_shouldReturnTask() {
        // When
        Optional<Task> taskOpt = taskService.getTaskById(1L);
        
        // Then
        assertTrue(taskOpt.isPresent());
        assertEquals("Faire les courses", taskOpt.get().getLabel());
        assertEquals(1L, taskOpt.get().getId());
    }

    @Test
    void getTaskById_withNonExistingId_shouldReturnEmpty() {
        // When
        Optional<Task> taskOpt = taskService.getTaskById(99L);
        
        // Then
        assertFalse(taskOpt.isPresent());
    }

    @Test
    void addTask_shouldAddTaskWithNewId() {
        // Given
        Task newTask = new Task.Builder(null, "Nouvelle tâche")
                .description("Description de la nouvelle tâche")
                .status(Task.STATUS_PENDING)
                .priority(Task.PRIORITY_HIGH)
                .build();
        
        // When
        Task savedTask = taskService.addTask(newTask);
        
        // Then
        assertNotNull(savedTask.getId());
        assertEquals(5L, savedTask.getId()); // Le prochain ID devrait être 5
        assertEquals("Nouvelle tâche", savedTask.getLabel());
        assertEquals(Task.STATUS_PENDING, savedTask.getStatus());
        assertEquals(Task.PRIORITY_HIGH, savedTask.getPriority());
        assertFalse(savedTask.isCompleted());
        assertNotNull(savedTask.getCreatedAt());
        assertNotNull(savedTask.getUpdatedAt());
        
        // Vérifier que la tâche a bien été ajoutée à la liste
        List<Task> allTasks = taskService.getAllTasks();
        assertEquals(5, allTasks.size());
        assertTrue(allTasks.stream().anyMatch(task -> "Nouvelle tâche".equals(task.getLabel())));
    }

    @Test
    void updateTaskCompletionStatus_withExistingId_shouldUpdateStatus() {
        // Given
        Long taskId = 1L;
        boolean newStatus = true;
        
        // When
        Optional<Task> updatedTaskOpt = taskService.updateTaskCompletionStatus(taskId, newStatus);
        
        // Then
        assertTrue(updatedTaskOpt.isPresent());
        Task updatedTask = updatedTaskOpt.get();
        assertEquals(taskId, updatedTask.getId());
        assertTrue(updatedTask.isCompleted());
        
        // Vérifier que le statut a bien été mis à jour dans la liste
        Optional<Task> retrievedTask = taskService.getTaskById(taskId);
        assertTrue(retrievedTask.isPresent());
        assertTrue(retrievedTask.get().isCompleted());
    }

    @Test
    void updateTaskCompletionStatus_withNonExistingId_shouldReturnEmpty() {
        // Given
        Long nonExistingId = 99L;
        
        // When
        Optional<Task> result = taskService.updateTaskCompletionStatus(nonExistingId, true);
        
        // Then
        assertFalse(result.isPresent());
    }
    
    @Test
    void updateTaskStatus_withExistingId_shouldUpdateStatus() {
        // Given
        Long taskId = 1L;
        String newStatus = Task.STATUS_IN_PROGRESS;
        
        // When
        Optional<Task> updatedTaskOpt = taskService.updateTaskStatus(taskId, newStatus);
        
        // Then
        assertTrue(updatedTaskOpt.isPresent());
        Task updatedTask = updatedTaskOpt.get();
        assertEquals(taskId, updatedTask.getId());
        assertEquals(Task.STATUS_IN_PROGRESS, updatedTask.getStatus());
        assertFalse(updatedTask.isCompleted()); // IN_PROGRESS n'est pas complété
        
        // Vérifier que le statut a bien été mis à jour dans la liste
        Optional<Task> retrievedTask = taskService.getTaskById(taskId);
        assertTrue(retrievedTask.isPresent());
        assertEquals(Task.STATUS_IN_PROGRESS, retrievedTask.get().getStatus());
    }
    
    @Test
    void updateTaskStatus_withNonExistingId_shouldReturnEmpty() {
        // Given
        Long nonExistingId = 99L;
        
        // When
        Optional<Task> result = taskService.updateTaskStatus(nonExistingId, Task.STATUS_COMPLETED);
        
        // Then
        assertFalse(result.isPresent());
    }
    
    @Test
    void updateTask_withExistingId_shouldUpdateAllFields() {
        // Given
        Long taskId = 1L;
        Task updatedTask = new Task.Builder(taskId, "Tâche mise à jour")
                .description("Description mise à jour")
                .status(Task.STATUS_IN_PROGRESS)
                .priority(Task.PRIORITY_HIGH)
                .pomodoroCount(3)
                .build();
        
        // When
        Optional<Task> result = taskService.updateTask(taskId, updatedTask);
        
        // Then
        assertTrue(result.isPresent());
        Task task = result.get();
        assertEquals(taskId, task.getId());
        assertEquals("Tâche mise à jour", task.getLabel());
        assertEquals("Description mise à jour", task.getDescription());
        assertEquals(Task.STATUS_IN_PROGRESS, task.getStatus());
        assertEquals(Task.PRIORITY_HIGH, task.getPriority());
        assertEquals(3, task.getPomodoroCount());
        assertFalse(task.isCompleted()); // Le statut IN_PROGRESS implique non complété
        
        // Vérifier que la tâche a bien été mise à jour dans la liste
        Optional<Task> retrievedTask = taskService.getTaskById(taskId);
        assertTrue(retrievedTask.isPresent());
        assertEquals("Tâche mise à jour", retrievedTask.get().getLabel());
        assertEquals(Task.STATUS_IN_PROGRESS, retrievedTask.get().getStatus());
    }
    
    @Test
    void updateTask_withNonExistingId_shouldReturnEmpty() {
        // Given
        Long nonExistingId = 99L;
        Task updatedTask = new Task.Builder(nonExistingId, "Tâche inexistante")
                .description("Description")
                .build();
        
        // When
        Optional<Task> result = taskService.updateTask(nonExistingId, updatedTask);
        
        // Then
        assertFalse(result.isPresent());
    }
}
