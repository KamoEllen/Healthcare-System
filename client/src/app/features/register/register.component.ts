import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card" style="max-width:480px">
        <div class="auth-header">
          <div class="auth-logo">✚</div>
          <h1>Create Account</h1>
          <p>Join MediCare as a patient</p>
        </div>

        <div class="msg msg-error"   *ngIf="error">{{ error }}</div>
        <div class="msg msg-success" *ngIf="success">{{ success }}</div>

        <form (ngSubmit)="onSubmit()" *ngIf="!success">
          <div class="form-grid-2">
            <div class="form-group">
              <label>First name</label>
              <input [(ngModel)]="form.first_name" name="first_name" required placeholder="Jane" />
            </div>
            <div class="form-group">
              <label>Last name</label>
              <input [(ngModel)]="form.last_name" name="last_name" required placeholder="Smith" />
            </div>
          </div>

          <div class="form-group">
            <label>Email address</label>
            <input type="email" [(ngModel)]="form.email" name="email" required
                   placeholder="jane@example.com" autocomplete="email" />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="form.password" name="password" required
                   placeholder="Min 8 chars, uppercase, digit, special" autocomplete="new-password" />
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label>Date of birth <span class="text-muted">(optional)</span></label>
              <input type="date" [(ngModel)]="form.date_of_birth" name="date_of_birth" />
            </div>
            <div class="form-group">
              <label>Gender <span class="text-muted">(optional)</span></label>
              <select [(ngModel)]="form.gender" name="gender">
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Blood type <span class="text-muted">(optional)</span></label>
            <select [(ngModel)]="form.blood_type" name="blood_type">
              <option value="">Unknown</option>
              <option *ngFor="let b of bloodTypes" [value]="b">{{ b }}</option>
            </select>
          </div>

          <button class="btn btn-primary btn-block mt-2" type="submit" [disabled]="loading">
            <span class="spinner" *ngIf="loading"></span>
            {{ loading ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Sign in</a>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  form = {
    email: '', password: '', first_name: '', last_name: '',
    date_of_birth: '', gender: '', blood_type: '',
  };
  bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
  error   = '';
  success = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    const payload: Record<string, unknown> = {
      email: this.form.email,
      password: this.form.password,
      first_name: this.form.first_name,
      last_name: this.form.last_name,
    };
    if (this.form.date_of_birth) payload['date_of_birth'] = this.form.date_of_birth;
    if (this.form.gender)        payload['gender']        = this.form.gender;
    if (this.form.blood_type)    payload['blood_type']    = this.form.blood_type;

    this.auth.register(payload).subscribe({
      next: () => {
        this.success = 'Account created! Please sign in.';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Registration failed';
        this.loading = false;
      },
    });
  }
}
