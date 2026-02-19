import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <span class="nav-icon">✓</span>
        <span>Task Manager</span>
      </div>
      <div class="nav-links">
        <a routerLink="/tasks" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          All Tasks
        </a>
        <a routerLink="/tasks/new" class="btn-primary-sm">+ New Task</a>
      </div>
    </nav>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      background: #1e293b;
      color: white;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;
    }
    .nav-icon {
      background: #6366f1;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .nav-links a {
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: white;
    }
    .btn-primary-sm {
      background: #6366f1 !important;
      color: white !important;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      font-weight: 600;
    }
    .btn-primary-sm:hover {
      background: #4f46e5 !important;
    }
    .main-content {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
  `]
})
export class AppComponent {}
