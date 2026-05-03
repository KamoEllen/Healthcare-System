import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

interface HealthRecord {
  id: string;
  patient_first_name: string; patient_last_name: string;
  doctor_first_name: string;  doctor_last_name: string;
  diagnosis: string;
  prescription: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
interface Patient { id: string; first_name: string; last_name: string; }

@Component({
  selector: 'app-health-records',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Health Records</h1>
          <p class="text-dim text-sm">{{ records.length }} record{{ records.length !== 1 ? 's' : '' }}</p>
        </div>
        <button *ngIf="auth.userRole === 'doctor'" class="btn btn-primary"
                (click)="showCreate = !showCreate; editingId = null">
          {{ showCreate ? '✕ Cancel' : '+ New record' }}
        </button>
      </div>

      <!-- Create panel -->
      <div class="card panel" *ngIf="showCreate && auth.userRole === 'doctor'">
        <div class="section-title">Create health record</div>
        <div class="msg msg-error" *ngIf="formError">{{ formError }}</div>

        <div class="form-group">
          <label>Patient</label>
          <select [(ngModel)]="newRecord.patient_id" name="patient_id">
            <option value="">Select patient…</option>
            <option *ngFor="let p of patients" [value]="p.id">
              {{ p.first_name }} {{ p.last_name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Diagnosis</label>
          <textarea [(ngModel)]="newRecord.diagnosis" name="diagnosis" rows="3"
                    placeholder="Clinical findings and diagnosis…" required></textarea>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Prescription <span class="text-muted">(optional)</span></label>
            <textarea [(ngModel)]="newRecord.prescription" name="prescription" rows="2"
                      placeholder="Medications prescribed…"></textarea>
          </div>
          <div class="form-group">
            <label>Notes <span class="text-muted">(optional)</span></label>
            <textarea [(ngModel)]="newRecord.notes" name="notes" rows="2"
                      placeholder="Additional notes…"></textarea>
          </div>
        </div>
        <button class="btn btn-primary" (click)="createRecord()"
                [disabled]="!newRecord.patient_id || !newRecord.diagnosis || saving">
          <span class="spinner" *ngIf="saving"></span>
          {{ saving ? 'Saving…' : 'Create record' }}
        </button>
      </div>

      <!-- Edit panel -->
      <div class="card panel" *ngIf="editingId && auth.userRole === 'doctor'">
        <div class="section-title">Edit record <span class="text-sm text-dim">(within 24h window)</span></div>
        <div class="msg msg-error" *ngIf="formError">{{ formError }}</div>

        <div class="form-group">
          <label>Diagnosis</label>
          <textarea [(ngModel)]="editRecord.diagnosis" name="edit_diagnosis" rows="3"></textarea>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Prescription</label>
            <textarea [(ngModel)]="editRecord.prescription" name="edit_prescription" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea [(ngModel)]="editRecord.notes" name="edit_notes" rows="2"></textarea>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-primary" (click)="saveEdit()" [disabled]="saving">
            <span class="spinner" *ngIf="saving"></span>
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
          <button class="btn btn-ghost" (click)="editingId = null; formError = ''">Cancel</button>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Diagnosis</th>
                <th>Prescription</th>
                <th *ngIf="auth.userRole === 'doctor'">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of records">
                <td class="text-sm text-dim" style="white-space:nowrap">
                  {{ r.created_at | date:'MMM d, y' }}
                </td>
                <td class="fw-600">{{ r.patient_first_name }} {{ r.patient_last_name }}</td>
                <td class="text-dim text-sm">Dr. {{ r.doctor_first_name }} {{ r.doctor_last_name }}</td>
                <td style="max-width:220px;font-size:0.85rem">{{ r.diagnosis }}</td>
                <td class="text-dim text-sm">{{ r.prescription ?? '—' }}</td>
                <td *ngIf="auth.userRole === 'doctor'">
                  <button *ngIf="canEdit(r)" class="btn btn-ghost btn-sm"
                          (click)="startEdit(r)">Edit</button>
                  <span *ngIf="!canEdit(r)" class="text-muted text-xs">Locked</span>
                </td>
              </tr>
              <tr *ngIf="records.length === 0">
                <td [attr.colspan]="auth.userRole === 'doctor' ? 6 : 5" class="table-empty">
                  No health records found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class HealthRecordsComponent implements OnInit {
  records: HealthRecord[] = [];
  patients: Patient[] = [];
  showCreate = false;
  editingId: string | null = null;
  saving = false;
  formError = '';

  newRecord  = { patient_id: '', diagnosis: '', prescription: '', notes: '' };
  editRecord = { diagnosis: '', prescription: '', notes: '' };

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRecords();
    if (this.auth.userRole === 'doctor') this.loadPatients();
  }

  canEdit(record: HealthRecord): boolean {
    return (Date.now() - new Date(record.created_at).getTime()) / 3_600_000 < 24;
  }

  loadRecords(): void {
    this.http.get<{ data: HealthRecord[] }>('/api/v1/health-records')
      .subscribe(r => this.records = r.data);
  }

  loadPatients(): void {
    this.http.get<{ data: Patient[] }>('/api/v1/patients')
      .subscribe(r => this.patients = r.data);
  }

  createRecord(): void {
    this.formError = '';
    this.saving = true;
    const payload: Record<string, unknown> = {
      patient_id: this.newRecord.patient_id,
      diagnosis:  this.newRecord.diagnosis,
    };
    if (this.newRecord.prescription) payload['prescription'] = this.newRecord.prescription;
    if (this.newRecord.notes)        payload['notes']        = this.newRecord.notes;

    this.http.post<{ data: HealthRecord }>('/api/v1/health-records', payload).subscribe({
      next: () => {
        this.showCreate = false;
        this.newRecord = { patient_id: '', diagnosis: '', prescription: '', notes: '' };
        this.saving = false;
        this.loadRecords();
      },
      error: err => {
        this.formError = err.error?.message ?? 'Failed to create record';
        this.saving = false;
      },
    });
  }

  startEdit(record: HealthRecord): void {
    this.editingId = record.id;
    this.showCreate = false;
    this.formError = '';
    this.editRecord = {
      diagnosis: record.diagnosis,
      prescription: record.prescription ?? '',
      notes: record.notes ?? '',
    };
  }

  saveEdit(): void {
    if (!this.editingId) return;
    this.formError = '';
    this.saving = true;
    const payload: Record<string, unknown> = { diagnosis: this.editRecord.diagnosis };
    if (this.editRecord.prescription) payload['prescription'] = this.editRecord.prescription;
    if (this.editRecord.notes)        payload['notes']        = this.editRecord.notes;

    this.http.patch<{ data: HealthRecord }>(`/api/v1/health-records/${this.editingId}`, payload).subscribe({
      next: () => {
        this.editingId = null;
        this.saving = false;
        this.loadRecords();
      },
      error: err => {
        this.formError = err.error?.message ?? 'Failed to update record';
        this.saving = false;
      },
    });
  }
}
