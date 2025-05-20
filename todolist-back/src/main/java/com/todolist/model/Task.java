package com.todolist.model;

import java.util.Date;

/**
 * Represents a task in the Todo List application
 */
public class Task {
    // Constants for statuses
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_IN_PROGRESS = "in-progress";
    public static final String STATUS_COMPLETED = "completed";
    public static final String STATUS_CANCELLED = "cancelled";
    
    // Constants for priorities
    public static final String PRIORITY_LOW = "low";
    public static final String PRIORITY_MEDIUM = "medium";
    public static final String PRIORITY_HIGH = "high";
    // Basic properties
    private Long id;
    private String label;
    private String description;
    
    // Additional properties to match the frontend
    private String status; // pending, in-progress, completed, cancelled
    private Date createdAt;
    private Date updatedAt;
    private Date dueDate;
    private String priority; // low, medium, high
    private Integer pomodoroCount; // Number of Pomodoro cycles
    
    // Default constructor
    public Task() {
        // Initialize default dates
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.status = STATUS_PENDING; // Default status
        this.priority = PRIORITY_MEDIUM; // Default priority
        this.pomodoroCount = 0; // No Pomodoro cycles by default
    }
    
    // Constructor with basic fields
    public Task(Long id, String label, String description, String status) {
        this();
        this.id = id;
        this.label = label;
        this.description = description;
        this.status = status != null ? status : STATUS_PENDING;
    }
    
    // Builder pattern to avoid constructor with too many parameters
    public static class Builder {
        private Long id;
        private String label;
        private String description;
        private String status = STATUS_PENDING;
        private Date createdAt = new Date();
        private Date updatedAt = new Date();
        private Date dueDate;
        private String priority = PRIORITY_MEDIUM;
        private Integer pomodoroCount = 0;
        
        public Builder(Long id, String label) {
            this.id = id;
            this.label = label;
        }
        
        public Builder description(String description) {
            this.description = description;
            return this;
        }
        
        /**
         * Compatibility method to maintain backwards compatibility
         * @deprecated Use status(String) instead
         */
        @Deprecated(since = "1.0.0", forRemoval = true)
        public Builder completed(boolean completed) {
            this.status = completed ? STATUS_COMPLETED : STATUS_PENDING;
            return this;
        }
        
        public Builder status(String status) {
            this.status = status;
            return this;
        }
        
        public Builder createdAt(Date createdAt) {
            this.createdAt = createdAt;
            return this;
        }
        
        public Builder updatedAt(Date updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }
        
        public Builder dueDate(Date dueDate) {
            this.dueDate = dueDate;
            return this;
        }
        
        public Builder priority(String priority) {
            this.priority = priority;
            return this;
        }
        
        public Builder pomodoroCount(Integer pomodoroCount) {
            this.pomodoroCount = pomodoroCount;
            return this;
        }
        
        public Task build() {
            Task task = new Task();
            task.id = this.id;
            task.label = this.label;
            task.description = this.description;
            task.status = this.status;
            task.createdAt = this.createdAt;
            task.updatedAt = this.updatedAt;
            task.dueDate = this.dueDate;
            task.priority = this.priority;
            task.pomodoroCount = this.pomodoroCount;
            return task;
        }
    }
    
    // Getters
    public Long getId() {
        return id;
    }
    
    public String getLabel() {
        return label;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Compatibility method to maintain backwards compatibility
     * @return true if the status is COMPLETED, false otherwise
     * @deprecated Use getStatus() instead
     */
    @Deprecated(since = "1.0.0", forRemoval = true)
    public boolean isCompleted() {
        return STATUS_COMPLETED.equals(status);
    }
    
    public String getStatus() {
        return status;
    }
    
    public Date getCreatedAt() {
        return createdAt;
    }
    
    public Date getUpdatedAt() {
        return updatedAt;
    }
    
    public Date getDueDate() {
        return dueDate;
    }
    
    public String getPriority() {
        return priority;
    }
    
    public Integer getPomodoroCount() {
        return pomodoroCount;
    }
    
    // Setters
    public void setId(Long id) {
        this.id = id;
    }
    
    public void setLabel(String label) {
        this.label = label;
        this.updatedAt = new Date(); // Update the modification date
    }
    
    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = new Date(); // Update the modification date
    }
    
    /**
     * Compatibility method to maintain backwards compatibility
     * @param completed true to mark as completed, false otherwise
     * @deprecated Use setStatus(String) instead
     */
    @Deprecated(since = "1.0.0", forRemoval = true)
    public void setCompleted(boolean completed) {
        // Update the status accordingly
        if (completed && !STATUS_CANCELLED.equals(this.status)) {
            this.status = STATUS_COMPLETED;
        } else if (!completed && STATUS_COMPLETED.equals(this.status)) {
            this.status = STATUS_PENDING;
        }
        this.updatedAt = new Date(); // Mettre à jour la date de modification
    }
    
    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = new Date(); // Mettre à jour la date de modification
    }
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
        this.updatedAt = new Date(); // Mettre à jour la date de modification
    }
    
    public void setPriority(String priority) {
        this.priority = priority;
        this.updatedAt = new Date(); // Mettre à jour la date de modification
    }
    
    public void setPomodoroCount(Integer pomodoroCount) {
        this.pomodoroCount = pomodoroCount;
        this.updatedAt = new Date(); // Mettre à jour la date de modification
    }
}
