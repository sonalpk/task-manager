package com.taskmanager.controller;

import com.taskmanager.dto.PagedResponse;
import com.taskmanager.dto.TaskDTO;
import com.taskmanager.dto.TaskFilterRequest;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Slf4j
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<PagedResponse<TaskDTO>> getAllTasks(
            @RequestParam(required = false) Boolean isCompleted,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueDateTo,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        TaskFilterRequest filterRequest = new TaskFilterRequest();
        filterRequest.setIsCompleted(isCompleted);
        filterRequest.setDueDateFrom(dueDateFrom);
        filterRequest.setDueDateTo(dueDateTo);
        filterRequest.setSortBy(sortBy);
        filterRequest.setSortDirection(sortDirection);
        filterRequest.setPage(page);
        filterRequest.setSize(size);

        return ResponseEntity.ok(taskService.getAllTasks(filterRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Integer id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@Valid @RequestBody TaskDTO taskDTO) {
        TaskDTO created = taskService.createTask(taskDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable Integer id,
            @Valid @RequestBody TaskDTO taskDTO
    ) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDTO));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskDTO> toggleCompletion(@PathVariable Integer id) {
        return ResponseEntity.ok(taskService.toggleCompletion(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
