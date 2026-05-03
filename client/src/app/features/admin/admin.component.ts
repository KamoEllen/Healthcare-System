import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface UserRow {
  id: string; email: string; role: string;
  first_name: string; last_name: string;
  is_active: boolean; email_verified: boolean; created_at: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Admin — User Management</h1>
          <p class="text-dim text-sm">
            {{ meta.total }} total &nbsp;·&nbsp; {{ adminCount }} admin &nbsp;·&nbsp;
            {{ doctorCount }} doctor &nbsp;·&nbsp; {{ patientCount }} patient
          </p>
        </div>
      </div>

      <div class="filter-tabs">
        <button class="filter-tab" [class.active]="filter === ''"
                (click)="setFilter('')">All</button>
        <button class="filter-tab" [class.active]="filter === 'admin'"
                (click)="setFilter('admin')">Admins</button>
        <button class="filter-tab" [class.active]="filter === 'doctor'"
                (click)="setFilter('doctor')">Doctors</button>
        <button class="filter-tab" [class.active]="filter === 'patient'"
                (click)="setFilter('patient')">Patients</button>
        <button class="filter-tab" [class.active]="filter === 'inactive'"
                (click)="setFilter('inactive')">Inactive</button>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of filtered">
                <td class="fw-600">{{ u.first_name }} {{ u.last_name }}</td>
                <td class="text-dim text-sm">{{ u.email }}</td>
                <td><span class="badge badge-{{u.role}}">{{ u.role }}</span></td>
                <td>
                  <span class="badge" [class]="u.is_active ? 'badge-active' : 'badge-inactive'">
                    {{ u.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class]="u.email_verified ? 'badge-active' : 'badge-cancelled'">
                    {{ u.email_verified ? '✓ Verified' : '✗ Unverified' }}
                  </span>
                </td>
                <td class="text-dim text-sm" style="white-space:nowrap">
                  {{ u.created_at | date:'MMM d, y' }}
                </td>
                <td>
                  <button class="btn btn-danger btn-sm"
                          (click)="deleteUser(u.id, u.first_name)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="filtered.length === 0">
                <td colspan="7" class="table-empty">No users found</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-muted text-sm mt-2">Showing {{ filtered.length }} of {{ meta.total }} users</p>
      </div>
    </div>
  `,
})
export class AdminComponent implements OnInit {
  users: UserRow[] = [];
  filtered: UserRow[] = [];
  meta = { total: 0 };
  filter = '';

  get adminCount():   number { return this.users.filter(u => u.role === 'admin').length; }
  get doctorCount():  number { return this.users.filter(u => u.role === 'doctor').length; }
  get patientCount(): number { return this.users.filter(u => u.role === 'patient').length; }

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadUsers(); }

  setFilter(f: string): void {
    this.filter = f;
    if (!f)                    this.filtered = [...this.users];
    else if (f === 'inactive') this.filtered = this.users.filter(u => !u.is_active);
    else                       this.filtered = this.users.filter(u => u.role === f);
  }

  loadUsers(): void {
    this.http.get<{ data: UserRow[]; meta: { total: number } }>('/api/v1/users?limit=200')
      .subscribe(r => {
        this.users = r.data;
        this.meta  = r.meta;
        this.setFilter(this.filter);
      });
  }

  deleteUser(id: string, name: string): void {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    this.http.delete(`/api/v1/users/${id}`).subscribe(() => this.loadUsers());
  }
}
