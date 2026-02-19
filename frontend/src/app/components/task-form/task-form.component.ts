import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-page">
      <div class="form-card">
        <div class="form-header">
          <h2>{{ isEditMode ? 'Edit Task' : 'Create New Task' }}</h2>
          <a routerLink="/tasks" class="btn-back">← Back to Tasks</a>
        </div>

        <div class="alert-error" *ngIf="serverError">{{ serverError }}</div>

        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" novalidate>

          <div class="form-group">
            <label for="title">Title <span class="required">*</span></label>
            <input
              id="title"
              type="text"
              formControlName="title"
              placeholder="Enter task title"
              [class.invalid]="isFieldInvalid('title')"
            />
            <div class="error-msg" *ngIf="isFieldInvalid('title')">
              <span *ngIf="taskForm.get('title')?.errors?.['required']">Title is required.</span>
              <span *ngIf="taskForm.get('title')?.errors?.['maxlength']">Title must not exceed 100 characters.</span>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              formControlName="description"
              placeholder="Optional description..."
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="datetime-local"
              formControlName="dueDate"
            />
          </div>

          <div class="form-group checkbox-group" *ngIf="isEditMode">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="isCompleted" />
              <span>Mark as completed</span>
            </label>
          </div>

          <div class="form-actions">
            <a routerLink="/tasks" class="btn-secondary">Cancel</a>
            <button type="submit" class="btn-primary" [disabled]="submitting">
              {{ submitting ? 'Saving...' : (isEditMode ? 'Update Task' : 'Create Task') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page { max-width: 600px; margin: 0 auto; }
    .form-card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
    .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .form-header h2 { margin: 0; color: #1e293b; font-size: 1.5rem; }
    .btn-back { color: #6366f1; text-decoration: none; font-size: 0.9rem; }
    .btn-back:hover { text-decoration: underline; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; font-weight: 600; color: #374151; margin-bottom: 0.4rem; font-size: 0.9rem; }
    .required { color: #dc2626; }
    .form-group input[type=text],
    .form-group input[type=datetime-local],
    .form-group textarea {
      width: 100%; box-sizing: border-box;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.65rem 0.9rem;
      font-size: 0.95rem;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none; border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
    }
    .form-group input.invalid { border-color: #dc2626; }
    .error-msg { color: #dc2626; font-size: 0.82rem; margin-top: 0.3rem; }
    .checkbox-group { display: flex; align-items: center; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.95rem; color: #374151; }
    .checkbox-label input { width: 18px; height: 18px; accent-color: #6366f1; }
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
    .btn-primary { background: #6366f1; color: white; border: none; padding: 0.65rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.95rem; }
    .btn-primary:hover:not(:disabled) { background: #4f46e5; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: white; border: 1.5px solid #e2e8f0; color: #374151; padding: 0.65rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.95rem; text-decoration: none; display: flex; align-items: center; }
    .btn-secondary:hover { background: #f9fafb; }
    .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
  `]
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  isEditMode = false;
  taskId?: number;
  submitting = false;
  serverError = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.taskId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.taskId;

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      dueDate: [''],
      isCompleted: [false]
    });

    if (this.isEditMode && this.taskId) {
      this.taskService.getTaskById(this.taskId).subscribe({
        next: (task) => this.patchForm(task),
        error: () => { this.serverError = 'Failed to load task.'; }
      });
    }
  }

  patchForm(task: Task): void {
    this.taskForm.patchValue({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.substring(0, 16) : '',
      isCompleted: task.isCompleted
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.taskForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.serverError = '';

    const formValue = this.taskForm.value;
    const task: Task = {
      title: formValue.title,
      description: formValue.description || undefined,
      isCompleted: formValue.isCompleted ?? false,
      dueDate: formValue.dueDate ? formValue.dueDate + ':00' : undefined
    };

    const request = this.isEditMode && this.taskId
      ? this.taskService.updateTask(this.taskId, task)
      : this.taskService.createTask(task);

    request.subscribe({
      next: (saved) => {
        this.router.navigate(['/tasks', saved.id]);
      },
      error: (err) => {
        this.submitting = false;
        if (err.error?.fieldErrors) {
          const errors = err.error.fieldErrors;
          Object.keys(errors).forEach(key => {
            const control = this.taskForm.get(key);
            if (control) control.setErrors({ serverError: errors[key] });
          });
        } else {
          this.serverError = err.error?.message || 'Failed to save task. Please try again.';
        }
      }
    });
  }
}
