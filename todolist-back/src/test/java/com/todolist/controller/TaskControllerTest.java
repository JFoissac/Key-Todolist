package com.todolist.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todolist.model.Task;
import com.todolist.model.TaskStatusUpdate;
import com.todolist.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @Autowired
    private ObjectMapper objectMapper;

    private Task task1;
    private Task task2;
    private Task task3;

    @BeforeEach
    void setUp() {
        task1 = new Task.Builder(1L, "Faire les courses")
                .description("Acheter du pain et du lait")
                .status(Task.STATUS_PENDING)
                .priority(Task.PRIORITY_MEDIUM)
                .build();
        
        task2 = new Task.Builder(2L, "Réviser pour l'examen")
                .description("Chapitres 1 à 5")
                .status(Task.STATUS_PENDING)
                .priority(Task.PRIORITY_HIGH)
                .build();
        
        task3 = new Task.Builder(3L, "Appeler le médecin")
                .description("Prendre rendez-vous")
                .status(Task.STATUS_COMPLETED) // Status is already set, no need for deprecated completed
                .priority(Task.PRIORITY_LOW)
                .build();
    }

    @Test
    void getAllTasks_shouldReturnAllTasks() throws Exception {
        when(taskService.getAllTasks()).thenReturn(Arrays.asList(task1, task2, task3));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].label", is("Faire les courses")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[2].id", is(3)));
    }

    @Test
    void getIncompleteTasks_shouldReturnOnlyIncompleteTasks() throws Exception {
        when(taskService.getIncompleteTasks()).thenReturn(Arrays.asList(task1, task2));

        mockMvc.perform(get("/api/tasks/incomplete"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[0].completed", is(false)))
                .andExpect(jsonPath("$[1].completed", is(false)));
    }

    @Test
    void getTaskById_withExistingId_shouldReturnTask() throws Exception {
        when(taskService.getTaskById(1L)).thenReturn(Optional.of(task1));

        mockMvc.perform(get("/api/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.label", is("Faire les courses")))
                .andExpect(jsonPath("$.description", is("Acheter du pain et du lait")))
                .andExpect(jsonPath("$.completed", is(false)));
    }

    @Test
    void getTaskById_withNonExistingId_shouldReturn404() throws Exception {
        when(taskService.getTaskById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void addTask_shouldCreateAndReturnTask() throws Exception {
        Task newTask = new Task.Builder(null, "Nouvelle tâche")
                .description("Description de la nouvelle tâche")
                .status(Task.STATUS_PENDING)
                .priority(Task.PRIORITY_MEDIUM)
                .build();
        
        Task savedTask = new Task.Builder(4L, "Nouvelle tâche")
                .description("Description de la nouvelle tâche")
                .status(Task.STATUS_PENDING)
                .priority(Task.PRIORITY_MEDIUM)
                .build();
        
        when(taskService.addTask(any(Task.class))).thenReturn(savedTask);

        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newTask)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(4)))
                .andExpect(jsonPath("$.label", is("Nouvelle tâche")))
                .andExpect(jsonPath("$.description", is("Description de la nouvelle tâche")))
                .andExpect(jsonPath("$.status", is(Task.STATUS_PENDING)))
                .andExpect(jsonPath("$.priority", is(Task.PRIORITY_MEDIUM)))
                .andExpect(jsonPath("$.completed", is(false)));
    }

    @Test
    void updateTaskCompletionStatus_withExistingId_shouldUpdateAndReturnTask() throws Exception {
        Task updatedTask = new Task.Builder(1L, "Faire les courses")
                .description("Acheter du pain et du lait")
                .status(Task.STATUS_COMPLETED) // Use status instead of deprecated completed
                .build();
                
        Map<String, Boolean> statusUpdate = new HashMap<>();
        statusUpdate.put("completed", true);
        
        when(taskService.updateTaskCompletionStatus(1L, true)).thenReturn(Optional.of(updatedTask));

        mockMvc.perform(patch("/api/tasks/1/completion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.status", is(Task.STATUS_COMPLETED))); // Check status instead of deprecated completed
    }

    @Test
    void updateTaskCompletionStatus_withNonExistingId_shouldReturn404() throws Exception {
        Map<String, Boolean> statusUpdate = new HashMap<>();
        statusUpdate.put("completed", true);
        
        when(taskService.updateTaskCompletionStatus(99L, true)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/api/tasks/99/completion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateTaskCompletionStatus_withMissingCompletedField_shouldReturn400() throws Exception {
        Map<String, String> invalidUpdate = new HashMap<>();
        invalidUpdate.put("someOtherField", "value");

        mockMvc.perform(patch("/api/tasks/1/completion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidUpdate)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void updateTaskStatus_withExistingId_shouldUpdateAndReturnTask() throws Exception {
        Task updatedTask = new Task.Builder(1L, "Faire les courses")
                .description("Acheter du pain et du lait")
                .status(Task.STATUS_IN_PROGRESS)
                .build();
                
        TaskStatusUpdate statusUpdate = new TaskStatusUpdate();
        statusUpdate.setStatus(Task.STATUS_IN_PROGRESS);
        
        when(taskService.updateTaskStatus(1L, Task.STATUS_IN_PROGRESS)).thenReturn(Optional.of(updatedTask));

        mockMvc.perform(patch("/api/tasks/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.status", is(Task.STATUS_IN_PROGRESS)));
    }
    
    @Test
    void updateTaskStatus_withNonExistingId_shouldReturn404() throws Exception {
        TaskStatusUpdate statusUpdate = new TaskStatusUpdate();
        statusUpdate.setStatus(Task.STATUS_IN_PROGRESS);
        
        when(taskService.updateTaskStatus(99L, Task.STATUS_IN_PROGRESS)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/api/tasks/99/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isNotFound());
    }
    
    @Test
    void updateTaskStatus_withInvalidStatus_shouldReturn400() throws Exception {
        TaskStatusUpdate statusUpdate = new TaskStatusUpdate();
        statusUpdate.setStatus("invalid_status");

        mockMvc.perform(patch("/api/tasks/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void updateTaskStatus_withMissingStatusField_shouldReturn400() throws Exception {
        Map<String, String> invalidUpdate = new HashMap<>();
        invalidUpdate.put("someOtherField", "value");

        mockMvc.perform(patch("/api/tasks/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidUpdate)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void updateTask_withExistingId_shouldUpdateAndReturnTask() throws Exception {
        Task updatedTask = new Task.Builder(1L, "Tâche mise à jour")
                .description("Description mise à jour")
                .status(Task.STATUS_IN_PROGRESS)
                .priority(Task.PRIORITY_HIGH)
                .pomodoroCount(3)
                .build();
        
        // Ensure that the task ID matches the URL ID
        updatedTask.setId(1L);
        
        // Use any(Task.class) so the mock matches any Task instance with the same ID
        when(taskService.updateTask(eq(1L), any(Task.class))).thenReturn(Optional.of(updatedTask));

        mockMvc.perform(patch("/api/tasks/1/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedTask)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.label", is("Tâche mise à jour")))
                .andExpect(jsonPath("$.description", is("Description mise à jour")))
                .andExpect(jsonPath("$.status", is(Task.STATUS_IN_PROGRESS)))
                .andExpect(jsonPath("$.priority", is(Task.PRIORITY_HIGH)))
                .andExpect(jsonPath("$.pomodoroCount", is(3)));
    }
    
    @Test
    void updateTask_withNonExistingId_shouldReturn404() throws Exception {
        Task updatedTask = new Task.Builder(99L, "Tâche inexistante")
                .description("Description")
                .build();
        
        // Utiliser any(Task.class) pour que le mock corresponde à n'importe quelle instance de Task avec le même ID
        when(taskService.updateTask(eq(99L), any(Task.class))).thenReturn(Optional.empty());

        mockMvc.perform(patch("/api/tasks/99/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedTask)))
                .andExpect(status().isNotFound());
    }
    
    @Test
    void updateTask_withMismatchedId_shouldReturn404() throws Exception {
        Task updatedTask = new Task.Builder(2L, "Tâche avec ID incorrect")
                .description("Description")
                .build();

        // The controller forces the ID to match the URL with task.setId(id)
        // then calls the service with this ID. Since ID 1 doesn't exist in our mock,
        // the service returns Optional.empty() and the controller returns 404
        when(taskService.updateTask(eq(1L), any(Task.class))).thenReturn(Optional.empty());

        mockMvc.perform(patch("/api/tasks/1/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedTask)))
                .andExpect(status().isNotFound());
    }
}
