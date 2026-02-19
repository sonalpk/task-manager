package com.taskmanager.service;

import com.taskmanager.dto.PagedResponse;
import com.taskmanager.dto.TaskDTO;
import com.taskmanager.dto.TaskFilterRequest;
import com.taskmanager.exception.TaskNotFoundException;
import com.taskmanager.model.TaskEntity;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TaskDTO> getAllTasks(TaskFilterRequest filterRequest) {
        log.debug("Fetching tasks with filters: {}", filterRequest);

        Sort sort = buildSort(filterRequest.getSortBy(), filterRequest.getSortDirection());
        Pageable pageable = PageRequest.of(filterRequest.getPage(), filterRequest.getSize(), sort);

        Page<TaskEntity> taskPage = taskRepository.findWithFilters(
                filterRequest.getIsCompleted(),
                filterRequest.getDueDateFrom(),
                filterRequest.getDueDateTo(),
                pageable
        );

        List<TaskDTO> content = taskPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return PagedResponse.<TaskDTO>builder()
                .content(content)
                .page(taskPage.getNumber())
                .size(taskPage.getSize())
                .totalElements(taskPage.getTotalElements())
                .totalPages(taskPage.getTotalPages())
                .last(taskPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TaskDTO getTaskById(Integer id) {
        log.debug("Fetching task with id: {}", id);
        TaskEntity task = findTaskById(id);
        return mapToDTO(task);
    }

    @Override
    public TaskDTO createTask(TaskDTO taskDTO) {
        log.debug("Creating new task: {}", taskDTO.getTitle());
        TaskEntity task = mapToEntity(taskDTO);
        if (task.getIsCompleted() == null) {
            task.setIsCompleted(false);
        }
        TaskEntity saved = taskRepository.save(task);
        return mapToDTO(saved);
    }

    @Override
    public TaskDTO updateTask(Integer id, TaskDTO taskDTO) {
        log.debug("Updating task with id: {}", id);
        TaskEntity existing = findTaskById(id);

        existing.setTitle(taskDTO.getTitle());
        existing.setDescription(taskDTO.getDescription());
        existing.setDueDate(taskDTO.getDueDate());
        if (taskDTO.getIsCompleted() != null) {
            existing.setIsCompleted(taskDTO.getIsCompleted());
        }

        TaskEntity updated = taskRepository.save(existing);
        return mapToDTO(updated);
    }

    @Override
    public TaskDTO toggleCompletion(Integer id) {
        log.debug("Toggling completion for task with id: {}", id);
        TaskEntity task = findTaskById(id);
        task.setIsCompleted(!task.getIsCompleted());
        TaskEntity updated = taskRepository.save(task);
        return mapToDTO(updated);
    }

    @Override
    public void deleteTask(Integer id) {
        log.debug("Deleting task with id: {}", id);
        TaskEntity task = findTaskById(id);
        taskRepository.delete(task);
    }

    // --- Private helpers ---

    private TaskEntity findTaskById(Integer id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    private Sort buildSort(String sortBy, String direction) {
        String field = switch (sortBy) {
            case "title" -> "title";
            case "dueDate" -> "dueDate";
            default -> "createdAt";
        };
        return "desc".equalsIgnoreCase(direction)
                ? Sort.by(field).descending()
                : Sort.by(field).ascending();
    }

    private TaskDTO mapToDTO(TaskEntity entity) {
        return TaskDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .isCompleted(entity.getIsCompleted())
                .dueDate(entity.getDueDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private TaskEntity mapToEntity(TaskDTO dto) {
        return TaskEntity.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .isCompleted(dto.getIsCompleted() != null ? dto.getIsCompleted() : false)
                .dueDate(dto.getDueDate())
                .build();
    }
}
