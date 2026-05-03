import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">✚</div>
          <h1>MediCare</h1>
          <p>Sign in to your account</p>
        </div>

        <div class="msg msg-error" *ngIf="error">{{ error }}</div>

        <form (ngSubmit)="onSubmit()" #f="ngForm">
          <div class="form-group">
            <label>Email address</label>
            <input type="email" [(ngModel)]="email" name="email" required
                   placeholder="you@example.com" autocomplete="email" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <div style="position:relative">
              <input [type]="showPw ? 'text' : 'password'" [(ngModel)]="password"
                     name="password" required autocomplete="current-password"
                     placeholder="••••••••" style="padding-right:2.8rem" />
              <button type="button" (click)="showPw = !showPw"
                      style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:0.85rem;padding:0">
                {{ showPw ? 'hide' : 'show' }}
              </button>
            </div>
          </div>

          <button class="btn btn-primary btn-block mt-2" type="submit" [disabled]="loading">
            <span class="spinner" *ngIf="loading"></span>
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <div class="auth-footer">
          No account? <a routerLink="/register">Create one</a>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPw = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.message ?? 'Login failed. Check your credentials.';
        this.loading = false;
      },
    });
  }
}
