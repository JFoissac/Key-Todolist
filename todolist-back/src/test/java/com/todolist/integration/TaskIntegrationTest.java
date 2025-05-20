package com.todolist.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todolist.model.Task;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TaskIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCompleteTaskLifecycle() throws Exception {
        // 1. Verify that the initial tasks are present
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[0].label", is("Faire les courses")));

        // 2. Get the incomplete tasks
        mockMvc.perform(get("/api/tasks/incomplete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[*].completed", everyItem(is(false))));

        // 3. Create a new task
        Task newTask = new Task.Builder(null, "Integration test task")
                .description("Test description")
                .status(Task.STATUS_PENDING)
                .priority(Task.PRIORITY_MEDIUM)
                .build();

        MvcResult postResult = mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newTask)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.label", is("Integration test task")))
                .andReturn();

        // 4. Get the ID of the created task
        String responseContent = postResult.getResponse().getContentAsString();
        Task createdTask = objectMapper.readValue(responseContent, Task.class);
        Long taskId = createdTask.getId();

        // 5. Get the task by its ID
        mockMvc.perform(get("/api/tasks/" + taskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(taskId.intValue())))
                .andExpect(jsonPath("$.label", is("Integration test task")))
                .andExpect(jsonPath("$.completed", is(false)));

        // 6. Update the task status
        // Use the completion endpoint that takes a boolean
        Map<String, Boolean> completionUpdate = new HashMap<>();
        completionUpdate.put("completed", true);

        mockMvc.perform(patch("/api/tasks/" + taskId + "/completion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(completionUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed", is(true)));

        // 7. Verify that the task is marked as completed
        mockMvc.perform(get("/api/tasks/" + taskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed", is(true)));

        // 8. Verify that the task no longer appears in the incomplete tasks
        mockMvc.perform(get("/api/tasks/incomplete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", not(hasItem(taskId.intValue()))));

        // 9. Test an error case - Non-existent ID
        mockMvc.perform(get("/api/tasks/999"))
                .andExpect(status().isNotFound());

        // 9. Test an error case - Invalid request
        Map<String, String> invalidUpdate = new HashMap<>();
        invalidUpdate.put("wrongField", "value");

        mockMvc.perform(patch("/api/tasks/" + taskId + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidUpdate)))
                .andExpect(status().isBadRequest());
        
        // 10. Test the complete update of a task
        Task updatedTask = new Task.Builder(taskId, "Updated task")
                .description("Updated description")
                .status(Task.STATUS_IN_PROGRESS)
                .priority(Task.PRIORITY_HIGH)
                .pomodoroCount(3)
                .dueDate(new java.util.Date())
                .build();
        
        mockMvc.perform(patch("/api/tasks/" + taskId + "/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedTask)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(taskId.intValue())))
                .andExpect(jsonPath("$.label", is("Updated task")))
                .andExpect(jsonPath("$.description", is("Updated description")))
                .andExpect(jsonPath("$.status", is(Task.STATUS_IN_PROGRESS)))
                .andExpect(jsonPath("$.priority", is(Task.PRIORITY_HIGH)))
                .andExpect(jsonPath("$.pomodoroCount", is(3)));
        
        // 11. Verify that the task has been updated correctly
        mockMvc.perform(get("/api/tasks/" + taskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label", is("Updated task")))
                .andExpect(jsonPath("$.status", is(Task.STATUS_IN_PROGRESS)));
        
        // 12. Test an error case - Non-existent ID
        // Use an ID that certainly doesn't exist (999999)
        Long nonExistingId = 999999L;
        Task taskWithNonExistingId = new Task.Builder(nonExistingId, "Task with non-existent ID")
                .description("Description")
                .build();

        mockMvc.perform(patch("/api/tasks/" + nonExistingId + "/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskWithNonExistingId)))
                .andExpect(status().isNotFound());
    }
}
