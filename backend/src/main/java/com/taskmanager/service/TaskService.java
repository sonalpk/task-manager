package com.taskmanager.service;

import com.taskmanager.dto.PagedResponse;
import com.taskmanager.dto.TaskDTO;
import com.taskmanager.dto.TaskFilterRequest;

public interface TaskService {
    PagedResponse<TaskDTO> getAllTasks(TaskFilterRequest filterRequest);
    TaskDTO getTaskById(Integer id);
    TaskDTO createTask(TaskDTO taskDTO);
    TaskDTO updateTask(Integer id, TaskDTO taskDTO);
    TaskDTO toggleCompletion(Integer id);
    void deleteTask(Integer id);
}
