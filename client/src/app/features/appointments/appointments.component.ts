import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

interface Appointment {
  id: string;
  doctor_first_name: string;  doctor_last_name: string;  doctor_specialisation: string;
  patient_first_name: string; patient_last_name: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
}
interface Doctor { id: string; first_name: string; last_name: string; specialisation: string; }

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Appointments</h1>
          <p class="text-dim text-sm">{{ filtered.length }} of {{ all.length }} shown</p>
        </div>
        <button *ngIf="auth.userRole === 'patient'" class="btn btn-primary"
                (click)="showBooking = !showBooking">
          {{ showBooking ? '✕ Cancel' : '+ Book appointment' }}
        </button>
      </div>

      <!-- Booking panel -->
      <div class="card panel" *ngIf="showBooking && auth.userRole === 'patient'">
        <div class="section-title">Book appointment</div>
        <div class="msg msg-error" *ngIf="bookError">{{ bookError }}</div>

        <div class="form-grid-2">
          <div class="form-group">
            <label>Doctor</label>
            <select [(ngModel)]="booking.doctor_id" name="doctor_id">
              <option value="">Select a doctor…</option>
              <option *ngFor="let d of doctors" [value]="d.id">
                Dr. {{ d.first_name }} {{ d.last_name }} — {{ d.specialisation }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Date &amp; time</label>
            <input type="datetime-local" [(ngModel)]="booking.scheduled_at" name="scheduled_at" />
          </div>
        </div>
        <div class="form-group">
          <label>Notes <span class="text-muted">(optional)</span></label>
          <textarea [(ngModel)]="booking.notes" name="notes" rows="2"
                    placeholder="Reason for visit…"></textarea>
        </div>
        <button class="btn btn-primary" (click)="bookAppointment()"
                [disabled]="!booking.doctor_id || !booking.scheduled_at || booking.loading">
          <span class="spinner" *ngIf="booking.loading"></span>
          {{ booking.loading ? 'Booking…' : 'Confirm booking' }}
        </button>
      </div>

      <!-- Filter tabs -->
      <div class="filter-tabs">
        <button class="filter-tab" [class.active]="filter === ''"
                (click)="setFilter('')">All</button>
        <button class="filter-tab" [class.active]="filter === 'pending'"
                (click)="setFilter('pending')">Pending</button>
        <button class="filter-tab" [class.active]="filter === 'confirmed'"
                (click)="setFilter('confirmed')">Confirmed</button>
        <button class="filter-tab" [class.active]="filter === 'completed'"
                (click)="setFilter('completed')">Completed</button>
        <button class="filter-tab" [class.active]="filter === 'cancelled'"
                (click)="setFilter('cancelled')">Cancelled</button>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date &amp; time</th>
                <th>{{ auth.userRole === 'patient' ? 'Doctor' : 'Patient' }}</th>
                <th *ngIf="auth.userRole === 'patient'">Specialisation</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of filtered">
                <td>{{ a.scheduled_at | date:'MMM d, y — h:mm a' }}</td>
                <td *ngIf="auth.userRole === 'patient'" class="fw-600">
                  Dr. {{ a.doctor_first_name }} {{ a.doctor_last_name }}
                </td>
                <td *ngIf="auth.userRole !== 'patient'">
                  {{ a.patient_first_name }} {{ a.patient_last_name }}
                </td>
                <td *ngIf="auth.userRole === 'patient'" class="text-dim text-sm">
                  {{ a.doctor_specialisation }}
                </td>
                <td><span class="badge badge-{{a.status}}">{{ a.status }}</span></td>
                <td class="text-dim text-sm" style="max-width:200px">
                  {{ a.notes ?? '—' }}
                </td>
                <td>
                  <div class="actions">
                    <button *ngIf="auth.userRole === 'doctor' && a.status === 'pending'"
                            class="btn btn-primary btn-sm"
                            (click)="updateStatus(a.id, 'confirmed')">Confirm</button>
                    <button *ngIf="auth.userRole === 'doctor' && a.status === 'confirmed'"
                            class="btn btn-ghost btn-sm"
                            (click)="updateStatus(a.id, 'completed')">Complete</button>
                    <button *ngIf="(auth.userRole === 'patient' || auth.userRole === 'admin') && (a.status === 'pending' || a.status === 'confirmed')"
                            class="btn btn-danger btn-sm"
                            (click)="cancel(a.id)">Cancel</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filtered.length === 0">
                <td [attr.colspan]="auth.userRole === 'patient' ? 6 : 5" class="table-empty">
                  No appointments found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AppointmentsComponent implements OnInit {
  all: Appointment[] = [];
  filtered: Appointment[] = [];
  doctors: Doctor[] = [];
  filter = '';
  showBooking = false;
  booking = { doctor_id: '', scheduled_at: '', notes: '', loading: false };
  bookError = '';

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAppointments();
    if (this.auth.userRole === 'patient') this.loadDoctors();
  }

  setFilter(status: string): void {
    this.filter = status;
    this.filtered = status ? this.all.filter(a => a.status === status) : [...this.all];
  }

  loadAppointments(): void {
    this.http.get<{ data: Appointment[] }>('/api/v1/appointments').subscribe(r => {
      this.all = r.data;
      this.filtered = this.filter ? r.data.filter(a => a.status === this.filter) : [...r.data];
    });
  }

  loadDoctors(): void {
    this.http.get<{ data: Doctor[] }>('/api/v1/doctors').subscribe(r => this.doctors = r.data);
  }

  bookAppointment(): void {
    this.bookError = '';
    this.booking.loading = true;
    const payload: Record<string, unknown> = {
      doctor_id: this.booking.doctor_id,
      scheduled_at: new Date(this.booking.scheduled_at).toISOString(),
    };
    if (this.booking.notes) payload['notes'] = this.booking.notes;

    this.http.post<{ data: Appointment }>('/api/v1/appointments', payload).subscribe({
      next: () => {
        this.showBooking = false;
        this.booking = { doctor_id: '', scheduled_at: '', notes: '', loading: false };
        this.loadAppointments();
      },
      error: err => {
        this.bookError = err.error?.message ?? 'Booking failed';
        this.booking.loading = false;
      },
    });
  }

  updateStatus(id: string, status: string): void {
    this.http.patch(`/api/v1/appointments/${id}/status`, { status })
      .subscribe(() => this.loadAppointments());
  }

  cancel(id: string): void {
    if (!confirm('Cancel this appointment?')) return;
    this.http.delete(`/api/v1/appointments/${id}`)
      .subscribe(() => this.loadAppointments());
  }
}
