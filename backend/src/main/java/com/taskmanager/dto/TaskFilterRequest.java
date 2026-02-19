package com.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskFilterRequest {
    private Boolean isCompleted;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dueDateFrom;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dueDateTo;

    private String sortBy = "createdAt"; // title, dueDate, createdAt
    private String sortDirection = "asc";
    private int page = 0;
    private int size = 10;
}
