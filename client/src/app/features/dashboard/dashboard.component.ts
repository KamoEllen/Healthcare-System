import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

interface PatientProfile {
  id: string; date_of_birth: string | null; gender: string | null;
  blood_type: string | null; allergies: string | null; emergency_contact: string | null;
}
interface DoctorProfile {
  id: string; specialisation: string; licence_number: string;
  phone: string | null; bio: string | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Welcome back, {{ auth.currentUser()?.first_name ?? 'there' }} 👋</h1>
          <p>
            <span class="badge badge-{{auth.userRole}}">{{ auth.userRole }}</span>
            <span class="text-muted text-sm" style="margin-left:0.5rem">{{ auth.currentUser()?.email }}</span>
          </p>
        </div>
      </div>

      <!-- Stat cards -->
      <div class="stats-grid">
        <div class="card stat-card">
          <span class="stat-icon">📅</span>
          <div class="stat-value">{{ stats.appointments }}</div>
          <div class="stat-label">Appointments</div>
          <a routerLink="/appointments" class="stat-link">View all →</a>
        </div>

        <div class="card stat-card">
          <span class="stat-icon">🩺</span>
          <div class="stat-value">{{ stats.records }}</div>
          <div class="stat-label">Health Records</div>
          <a routerLink="/health-records" class="stat-link">View all →</a>
        </div>

        <div class="card stat-card" *ngIf="auth.userRole === 'admin'">
          <span class="stat-icon">👥</span>
          <div class="stat-value">{{ stats.users }}</div>
          <div class="stat-label">Total Users</div>
          <a routerLink="/admin" class="stat-link">Manage →</a>
        </div>

        <div class="card stat-card" *ngIf="auth.userRole === 'admin'">
          <span class="stat-icon">🏥</span>
          <div class="stat-value">{{ stats.doctors }}</div>
          <div class="stat-label">Doctors</div>
          <a routerLink="/admin" class="stat-link">View →</a>
        </div>
      </div>

      <!-- Patient profile -->
      <div class="card mb-3" *ngIf="auth.userRole === 'patient' && patient">
        <div class="section-title">My Profile</div>
        <div class="profile-grid">
          <div class="profile-item">
            <label>Date of birth</label>
            <span>{{ patient.date_of_birth ? (patient.date_of_birth | date:'mediumDate') : '—' }}</span>
          </div>
          <div class="profile-item">
            <label>Gender</label>
            <span>{{ patient.gender ?? '—' }}</span>
          </div>
          <div class="profile-item">
            <label>Blood type</label>
            <span>{{ patient.blood_type ?? '—' }}</span>
          </div>
          <div class="profile-item">
            <label>Allergies</label>
            <span>{{ patient.allergies ?? 'None recorded' }}</span>
          </div>
          <div class="profile-item">
            <label>Emergency contact</label>
            <span>{{ patient.emergency_contact ?? '—' }}</span>
          </div>
          <div class="profile-item">
            <label>Email verified</label>
            <span>
              <span class="badge" [class]="auth.currentUser()?.email_verified ? 'badge-active' : 'badge-cancelled'">
                {{ auth.currentUser()?.email_verified ? 'Verified' : 'Unverified' }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Doctor profile -->
      <div class="card mb-3" *ngIf="auth.userRole === 'doctor' && doctor">
        <div class="section-title">My Profile</div>
        <div class="profile-grid">
          <div class="profile-item">
            <label>Specialisation</label>
            <span>{{ doctor.specialisation }}</span>
          </div>
          <div class="profile-item">
            <label>Licence number</label>
            <span>{{ doctor.licence_number }}</span>
          </div>
          <div class="profile-item">
            <label>Phone</label>
            <span>{{ doctor.phone ?? '—' }}</span>
          </div>
          <div class="profile-item" style="grid-column: span 2">
            <label>Bio</label>
            <span>{{ doctor.bio ?? '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Quick links -->
      <div class="card">
        <div class="section-title">Quick actions</div>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
          <a routerLink="/appointments" class="btn btn-primary" *ngIf="auth.userRole === 'patient'">
            📅 Book appointment
          </a>
          <a routerLink="/appointments" class="btn btn-ghost">
            📋 View appointments
          </a>
          <a routerLink="/health-records" class="btn btn-ghost">
            🩺 Health records
          </a>
          <a routerLink="/admin" class="btn btn-danger" *ngIf="auth.userRole === 'admin'">
            ⚙️ Admin panel
          </a>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  stats = { appointments: 0, records: 0, users: 0, doctors: 0 };
  patient: PatientProfile | null = null;
  doctor: DoctorProfile | null = null;

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ meta: { total: number } }>('/api/v1/appointments')
      .subscribe(r => this.stats.appointments = r.meta.total);
    this.http.get<{ meta: { total: number } }>('/api/v1/health-records')
      .subscribe(r => this.stats.records = r.meta.total);

    if (this.auth.userRole === 'patient') {
      this.http.get<{ data: PatientProfile }>('/api/v1/patients/me')
        .subscribe({ next: r => this.patient = r.data, error: () => {} });
    }
    if (this.auth.userRole === 'doctor') {
      this.http.get<{ data: DoctorProfile }>('/api/v1/doctors/me')
        .subscribe({ next: r => this.doctor = r.data, error: () => {} });
    }
    if (this.auth.userRole === 'admin') {
      this.http.get<{ meta: { total: number } }>('/api/v1/users')
        .subscribe(r => this.stats.users = r.meta.total);
      this.http.get<{ meta: { total: number } }>('/api/v1/doctors')
        .subscribe(r => this.stats.doctors = r.meta.total);
    }
  }
}
