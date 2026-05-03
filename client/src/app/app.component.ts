import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="bg-blob bg-blob-1"></div>
    <div class="bg-blob bg-blob-2"></div>
    <div class="bg-blob bg-blob-3"></div>

    <div class="app-shell">
      <nav *ngIf="auth.isLoggedIn">
        <a routerLink="/dashboard" class="nav-brand">
          <div class="nav-brand-icon">✚</div>
          <span class="nav-brand-name">MediCare</span>
        </a>

        <div class="nav-links">
          <a routerLink="/dashboard"     routerLinkActive="active" class="nav-link">Dashboard</a>
          <a routerLink="/appointments"  routerLinkActive="active" class="nav-link">Appointments</a>
          <a routerLink="/health-records" routerLinkActive="active" class="nav-link">Records</a>
          <a *ngIf="auth.userRole === 'admin'" routerLink="/admin" routerLinkActive="active" class="nav-link">Admin</a>
        </div>

        <div class="nav-right">
          <div class="nav-user">
            <div class="nav-avatar">{{ initials }}</div>
            <span class="text-sm text-dim">{{ auth.currentUser()?.first_name }}</span>
            <span class="badge badge-{{auth.userRole}}">{{ auth.userRole }}</span>
          </div>
          <button class="btn btn-danger btn-sm" (click)="auth.logout()">Logout</button>
        </div>
      </nav>

      <router-outlet />
    </div>
  `,
})
export class AppComponent {
  constructor(public auth: AuthService) {}

  get initials(): string {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return (u.first_name[0] + (u.last_name[0] ?? '')).toUpperCase();
  }
}
