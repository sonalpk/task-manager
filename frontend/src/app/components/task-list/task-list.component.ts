import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task, TaskFilter, PagedResponse } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <h1>Tasks</h1>
      <a routerLink="/tasks/new" class="btn-primary">+ Add New Task</a>
    </div>

    <!-- Filters -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label>Status</label>
          <select [(ngModel)]="filter.isCompleted" (change)="onFilterChange()">
            <option [ngValue]="undefined">All</option>
            <option [ngValue]="false">Pending</option>
            <option [ngValue]="true">Completed</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Due From</label>
          <input type="datetime-local" [(ngModel)]="dueDateFrom" (change)="onFilterChange()" />
        </div>
        <div class="filter-group">
          <label>Due To</label>
          <input type="datetime-local" [(ngModel)]="dueDateTo" (change)="onFilterChange()" />
        </div>
        <div class="filter-group">
          <label>Sort By</label>
          <select [(ngModel)]="filter.sortBy" (change)="onFilterChange()">
            <option value="createdAt">Created Date</option>
            <option value="title">Title</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Direction</label>
          <select [(ngModel)]="filter.sortDirection" (change)="onFilterChange()">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Per Page</label>
          <select [(ngModel)]="filter.size" (change)="onFilterChange()">
            <option [ngValue]="5">5</option>
            <option [ngValue]="10">10</option>
            <option [ngValue]="25">25</option>
          </select>
        </div>
        <button class="btn-secondary" (click)="resetFilters()">Reset</button>
      </div>
    </div>

    <!-- Error -->
    <div class="alert-error" *ngIf="error">{{ error }}</div>

    <!-- Loading -->
    <div class="loading" *ngIf="loading">Loading tasks...</div>

    <!-- Empty State -->
    <div class="empty-state" *ngIf="!loading && tasks.length === 0">
      <div class="empty-icon">📋</div>
      <h3>No tasks found</h3>
      <p>Try adjusting your filters or create a new task.</p>
      <a routerLink="/tasks/new" class="btn-primary">Create Task</a>
    </div>

    <!-- Task Table -->
    <div class="task-table-container" *ngIf="!loading && tasks.length > 0">
      <table class="task-table">
        <thead>
          <tr>
            <th style="width: 40px;">Done</th>
            <th>Title</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th style="width: 140px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let task of tasks" [class.completed-row]="task.isCompleted">
            <td class="center">
              <input
                type="checkbox"
                [checked]="task.isCompleted"
                (change)="toggleTask(task)"
                class="checkbox"
                title="Toggle completion"
              />
            </td>
            <td>
              <a [routerLink]="['/tasks', task.id]" class="task-title-link" [class.completed-text]="task.isCompleted">
                {{ task.title }}
              </a>
            </td>
            <td class="description-cell">{{ task.description || '—' }}</td>
            <td>
              <span *ngIf="task.dueDate" [class.overdue]="isOverdue(task)">
                {{ task.dueDate | date:'MMM d, y HH:mm' }}
              </span>
              <span *ngIf="!task.dueDate" class="muted">No due date</span>
            </td>
            <td>
              <span class="badge" [class.badge-done]="task.isCompleted" [class.badge-pending]="!task.isCompleted">
                {{ task.isCompleted ? 'Completed' : 'Pending' }}
              </span>
            </td>
            <td class="actions">
              <a [routerLink]="['/tasks', task.id, 'edit']" class="btn-icon" title="Edit">✏️</a>
              <button (click)="deleteTask(task)" class="btn-icon btn-danger" title="Delete">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" *ngIf="pagedResponse && pagedResponse.totalPages > 1">
      <button (click)="changePage(0)" [disabled]="filter.page === 0" class="btn-page">««</button>
      <button (click)="changePage((filter.page || 0) - 1)" [disabled]="filter.page === 0" class="btn-page">‹</button>
      <span class="page-info">Page {{ (filter.page || 0) + 1 }} of {{ pagedResponse.totalPages }}</span>
      <button (click)="changePage((filter.page || 0) + 1)" [disabled]="pagedResponse.last" class="btn-page">›</button>
      <button (click)="changePage(pagedResponse.totalPages - 1)" [disabled]="pagedResponse.last" class="btn-page">»»</button>
    </div>

    <div class="total-info" *ngIf="pagedResponse">
      Total: {{ pagedResponse.totalElements }} task(s)
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
    .filter-card { background: white; border-radius: 10px; padding: 1rem 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .filter-row { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; gap: 4px; }
    .filter-group label { font-size: 0.78rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
    .filter-group select, .filter-group input { border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.4rem 0.6rem; font-size: 0.9rem; background: white; }
    .task-table-container { background: white; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; }
    .task-table { width: 100%; border-collapse: collapse; }
    .task-table th { background: #f8fafc; padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
    .task-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 0.9rem; }
    .task-table tr:last-child td { border-bottom: none; }
    .task-table tr:hover { background: #fafafa; }
    .completed-row { opacity: 0.6; }
    .completed-text { text-decoration: line-through; color: #94a3b8; }
    .task-title-link { color: #1e293b; text-decoration: none; font-weight: 500; }
    .task-title-link:hover { color: #6366f1; }
    .description-cell { color: #64748b; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .badge { padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
    .badge-done { background: #dcfce7; color: #15803d; }
    .badge-pending { background: #fef3c7; color: #b45309; }
    .overdue { color: #dc2626; font-weight: 600; }
    .muted { color: #94a3b8; }
    .center { text-align: center; }
    .checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: #6366f1; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0.3rem; border-radius: 4px; transition: background 0.2s; text-decoration: none; }
    .btn-icon:hover { background: #f1f5f9; }
    .btn-danger:hover { background: #fee2e2 !important; }
    .btn-primary { background: #6366f1; color: white; padding: 0.5rem 1.25rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-secondary { background: white; border: 1px solid #e2e8f0; color: #374151; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
    .btn-secondary:hover { background: #f9fafb; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 1.5rem; }
    .btn-page { background: white; border: 1px solid #e2e8f0; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; }
    .btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-page:not(:disabled):hover { background: #f1f5f9; }
    .page-info { color: #64748b; font-size: 0.9rem; padding: 0 0.5rem; }
    .total-info { text-align: center; color: #94a3b8; font-size: 0.85rem; margin-top: 0.75rem; }
    .loading { text-align: center; padding: 3rem; color: #64748b; }
    .empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state h3 { color: #1e293b; margin: 0 0 0.5rem; }
    .empty-state p { color: #64748b; margin: 0 0 1.5rem; }
    .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
  `]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  pagedResponse: PagedResponse<Task> | null = null;
  loading = false;
  error = '';

  filter: TaskFilter = {
    sortBy: 'createdAt',
    sortDirection: 'asc',
    page: 0,
    size: 10
  };

  dueDateFrom = '';
  dueDateTo = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = '';

    const f = { ...this.filter };
    if (this.dueDateFrom) f.dueDateFrom = this.dueDateFrom.replace('T', 'T') + ':00';
    if (this.dueDateTo) f.dueDateTo = this.dueDateTo.replace('T', 'T') + ':00';

    this.taskService.getTasks(f).subscribe({
      next: (response) => {
        this.pagedResponse = response;
        this.tasks = response.content;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load tasks. Is the backend running?';
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filter.page = 0;
    this.loadTasks();
  }

  changePage(page: number): void {
    this.filter.page = page;
    this.loadTasks();
  }

  resetFilters(): void {
    this.filter = { sortBy: 'createdAt', sortDirection: 'asc', page: 0, size: 10 };
    this.dueDateFrom = '';
    this.dueDateTo = '';
    this.loadTasks();
  }

  toggleTask(task: Task): void {
    if (!task.id) return;
    this.taskService.toggleCompletion(task.id).subscribe({
      next: (updated) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) this.tasks[index] = updated;
      },
      error: () => {
        this.error = 'Failed to toggle task completion.';
      }
    });
  }

  deleteTask(task: Task): void {
    if (!task.id) return;
    if (!confirm(`Delete task "${task.title}"?`)) return;
    this.taskService.deleteTask(task.id).subscribe({
      next: () => this.loadTasks(),
      error: () => { this.error = 'Failed to delete task.'; }
    });
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.isCompleted) return false;
    return new Date(task.dueDate) < new Date();
  }
}
