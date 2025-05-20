package com.todolist.controller;

import com.todolist.model.Task;
import com.todolist.model.TaskStatusUpdate;
import com.todolist.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for task operations
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*") // Allow cross-origin requests from frontend
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Get all tasks
     * @return List of all tasks
     */
    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    /**
     * Get incomplete tasks
     * @return List of tasks to do
     */
    @GetMapping("/incomplete")
    public List<Task> getIncompleteTasks() {
        return taskService.getIncompleteTasks();
    }

    /**
     * Get a task by its ID
     * @param id Task ID
     * @return Matching task or 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Optional<Task> task = taskService.getTaskById(id);
        return task.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Add a new task
     * @param task Task to add
     * @return Added task with its ID
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task addTask(@RequestBody Task task) {
        return taskService.addTask(task);
    }

    /**
     * Update task status
     * @param id Task ID
     * @param statusUpdate Object containing the new status
     * @return Updated task or 404 if not found
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody TaskStatusUpdate statusUpdate) {
        
        String status = statusUpdate.getStatus();
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // Verify that the status is valid
        if (!status.equals(Task.STATUS_PENDING) && 
            !status.equals(Task.STATUS_IN_PROGRESS) && 
            !status.equals(Task.STATUS_COMPLETED) && 
            !status.equals(Task.STATUS_CANCELLED)) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Task> updatedTask = taskService.updateTaskStatus(id, status);
        return updatedTask.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    /**
     * Compatibility method to update task completion status
     * @param id Task ID
     * @param statusUpdate Map containing the new completion status
     * @return Updated task or 404 if not found
     * @deprecated Use updateTaskStatus with a complete status instead. Will be removed in version 2.0.0
     */
    @Deprecated(since = "1.0.0", forRemoval = true)
    @PatchMapping("/{id}/completion")
    public ResponseEntity<Task> updateTaskCompletionStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> statusUpdate) {
        
        Boolean completed = statusUpdate.get("completed");
        if (completed == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Task> updatedTask = taskService.updateTaskCompletionStatus(id, completed);
        return updatedTask.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    /**
     * Update a complete task
     * @param id ID of the task to update
     * @param task New task data
     * @return Updated task or 404 if not found
     */
    @PatchMapping("/{id}/update")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @RequestBody Task task) {
        
        // Ensure the ID is correctly set
        task.setId(id); // Force the ID to avoid inconsistencies
        
        Optional<Task> updatedTask = taskService.updateTask(id, task);
        return updatedTask.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    /**
     * Delete a task by its ID
     * @param id ID of the task to delete
     * @return 204 No Content if deleted, 404 Not Found if not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        boolean deleted = taskService.deleteTask(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
