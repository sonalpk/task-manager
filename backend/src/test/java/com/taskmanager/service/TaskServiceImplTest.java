package com.taskmanager.service;

import com.taskmanager.dto.PagedResponse;
import com.taskmanager.dto.TaskDTO;
import com.taskmanager.dto.TaskFilterRequest;
import com.taskmanager.exception.TaskNotFoundException;
import com.taskmanager.model.TaskEntity;
import com.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceImplTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    private TaskEntity sampleTask;
    private TaskDTO sampleTaskDTO;

    @BeforeEach
    void setUp() {
        sampleTask = TaskEntity.builder()
                .id(1)
                .title("Test Task")
                .description("Test Description")
                .isCompleted(false)
                .dueDate(LocalDateTime.now().plusDays(3))
                .createdAt(LocalDateTime.now())
                .build();

        sampleTaskDTO = TaskDTO.builder()
                .title("Test Task")
                .description("Test Description")
                .isCompleted(false)
                .dueDate(LocalDateTime.now().plusDays(3))
                .build();
    }

    // Test Case 1: Create task successfully
    @Test
    @DisplayName("Should create a task successfully with default isCompleted = false")
    void shouldCreateTaskSuccessfully() {
        when(taskRepository.save(any(TaskEntity.class))).thenReturn(sampleTask);

        TaskDTO result = taskService.createTask(sampleTaskDTO);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Task");
        assertThat(result.getIsCompleted()).isFalse();
        assertThat(result.getDescription()).isEqualTo("Test Description");

        verify(taskRepository, times(1)).save(any(TaskEntity.class));
    }

    // Test Case 2: Toggle completion flips the status
    @Test
    @DisplayName("Should toggle task completion status from false to true")
    void shouldToggleTaskCompletionStatus() {
        when(taskRepository.findById(1)).thenReturn(Optional.of(sampleTask));

        TaskEntity toggled = TaskEntity.builder()
                .id(1)
                .title("Test Task")
                .description("Test Description")
                .isCompleted(true)  // toggled
                .createdAt(sampleTask.getCreatedAt())
                .build();
        when(taskRepository.save(any(TaskEntity.class))).thenReturn(toggled);

        TaskDTO result = taskService.toggleCompletion(1);

        assertThat(result).isNotNull();
        assertThat(result.getIsCompleted()).isTrue();
        verify(taskRepository).findById(1);
        verify(taskRepository).save(argThat(t -> t.getIsCompleted() == Boolean.TRUE));
    }

    @Test
    @DisplayName("Should throw TaskNotFoundException when toggling non-existent task")
    void shouldThrowExceptionWhenTogglingNonExistentTask() {
        when(taskRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.toggleCompletion(999))
                .isInstanceOf(TaskNotFoundException.class)
                .hasMessageContaining("999");

        verify(taskRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should retrieve all tasks with pagination")
    void shouldGetAllTasksWithPagination() {
        Page<TaskEntity> mockPage = new PageImpl<>(List.of(sampleTask), PageRequest.of(0, 10), 1);
        when(taskRepository.findWithFilters(isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(mockPage);

        TaskFilterRequest request = new TaskFilterRequest();
        PagedResponse<TaskDTO> response = taskService.getAllTasks(request);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getTotalElements()).isEqualTo(1);
        assertThat(response.getPage()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should throw TaskNotFoundException when task not found by id")
    void shouldThrowExceptionWhenTaskNotFound() {
        when(taskRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTaskById(999))
                .isInstanceOf(TaskNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("Should delete task successfully")
    void shouldDeleteTaskSuccessfully() {
        when(taskRepository.findById(1)).thenReturn(Optional.of(sampleTask));
        doNothing().when(taskRepository).delete(sampleTask);

        assertThatCode(() -> taskService.deleteTask(1)).doesNotThrowAnyException();

        verify(taskRepository).delete(sampleTask);
    }
}
