import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-page">
      <div class="loading" *ngIf="loading">Loading...</div>
      <div class="alert-error" *ngIf="error">{{ error }}</div>

      <div *ngIf="task && !loading" class="detail-card">
        <div class="detail-header">
          <div class="header-left">
            <a routerLink="/tasks" class="btn-back">← Back to Tasks</a>
            <h2 [class.completed-title]="task.isCompleted">{{ task.title }}</h2>
          </div>
          <div class="header-actions">
            <button (click)="toggleCompletion()" class="btn-toggle" [class.btn-undo]="task.isCompleted">
              {{ task.isCompleted ? '↩ Mark Pending' : '✓ Mark Complete' }}
            </button>
            <a [routerLink]="['/tasks', task.id, 'edit']" class="btn-edit">✏️ Edit</a>
            <button (click)="deleteTask()" class="btn-delete">🗑️ Delete</button>
          </div>
        </div>

        <div class="status-row">
          <span class="badge" [class.badge-done]="task.isCompleted" [class.badge-pending]="!task.isCompleted">
            {{ task.isCompleted ? '✓ Completed' : '⏳ Pending' }}
          </span>
          <span class="due-label" *ngIf="task.dueDate" [class.overdue]="isOverdue()">
            📅 Due: {{ task.dueDate | date:'MMMM d, yyyy HH:mm' }}
            <span *ngIf="isOverdue()"> (Overdue)</span>
          </span>
          <span class="due-label muted" *ngIf="!task.dueDate">No due date set</span>
        </div>

        <div class="description-section">
          <h4>Description</h4>
          <p *ngIf="task.description" class="description-text">{{ task.description }}</p>
          <p *ngIf="!task.description" class="muted">No description provided.</p>
        </div>

        <div class="meta-section">
          <div class="meta-item">
            <span class="meta-label">Created</span>
            <span>{{ task.createdAt | date:'MMMM d, yyyy HH:mm' }}</span>
          </div>
          <div class="meta-item" *ngIf="task.updatedAt">
            <span class="meta-label">Last Updated</span>
            <span>{{ task.updatedAt | date:'MMMM d, yyyy HH:mm' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Task ID</span>
            <span>#{{ task.id }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-page { max-width: 700px; margin: 0 auto; }
    .detail-card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .header-left { display: flex; flex-direction: column; gap: 0.5rem; }
    .btn-back { color: #6366f1; text-decoration: none; font-size: 0.9rem; }
    .btn-back:hover { text-decoration: underline; }
    .detail-header h2 { margin: 0; font-size: 1.6rem; color: #1e293b; }
    .completed-title { text-decoration: line-through; color: #94a3b8; }
    .header-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-toggle { background: #dcfce7; color: #15803d; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
    .btn-toggle:hover { background: #bbf7d0; }
    .btn-undo { background: #fef3c7; color: #b45309; }
    .btn-undo:hover { background: #fde68a; }
    .btn-edit { background: #e0e7ff; color: #4338ca; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .btn-edit:hover { background: #c7d2fe; }
    .btn-delete { background: #fee2e2; color: #dc2626; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
    .btn-delete:hover { background: #fecaca; }
    .status-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 8px; }
    .badge { padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
    .badge-done { background: #dcfce7; color: #15803d; }
    .badge-pending { background: #fef3c7; color: #b45309; }
    .due-label { font-size: 0.9rem; color: #374151; }
    .overdue { color: #dc2626; font-weight: 600; }
    .muted { color: #94a3b8; }
    .description-section { margin-bottom: 1.5rem; }
    .description-section h4 { margin: 0 0 0.5rem; color: #64748b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .description-text { color: #374151; line-height: 1.7; white-space: pre-wrap; margin: 0; }
    .meta-section { display: flex; gap: 2rem; flex-wrap: wrap; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
    .meta-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .meta-label { font-size: 0.78rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
    .loading { text-align: center; padding: 3rem; color: #64748b; }
    .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.75rem 1rem; border-radius: 8px; }
  `]
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    this.loading = true;
    this.taskService.getTaskById(id).subscribe({
      next: (task) => { this.task = task; this.loading = false; },
      error: (err) => {
        this.error = err.error?.message || 'Task not found.';
        this.loading = false;
      }
    });
  }

  toggleCompletion(): void {
    if (!this.task?.id) return;
    this.taskService.toggleCompletion(this.task.id).subscribe({
      next: (updated) => { this.task = updated; },
      error: () => { this.error = 'Failed to toggle completion.'; }
    });
  }

  deleteTask(): void {
    if (!this.task?.id || !confirm(`Delete task "${this.task.title}"?`)) return;
    this.taskService.deleteTask(this.task.id).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: () => { this.error = 'Failed to delete task.'; }
    });
  }

  isOverdue(): boolean {
    if (!this.task?.dueDate || this.task.isCompleted) return false;
    return new Date(this.task.dueDate) < new Date();
  }
}
