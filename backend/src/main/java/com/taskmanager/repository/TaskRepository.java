package com.taskmanager.repository;

import com.taskmanager.model.TaskEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, Integer> {

    Page<TaskEntity> findByIsCompleted(Boolean isCompleted, Pageable pageable);

    @Query("SELECT t FROM TaskEntity t WHERE " +
           "(:isCompleted IS NULL OR t.isCompleted = :isCompleted) AND " +
           "(:dueDateFrom IS NULL OR t.dueDate >= :dueDateFrom) AND " +
           "(:dueDateTo IS NULL OR t.dueDate <= :dueDateTo)")
    Page<TaskEntity> findWithFilters(
            @Param("isCompleted") Boolean isCompleted,
            @Param("dueDateFrom") LocalDateTime dueDateFrom,
            @Param("dueDateTo") LocalDateTime dueDateTo,
            Pageable pageable
    );
}
