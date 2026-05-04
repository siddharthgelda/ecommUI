// src/app/features/profile/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService }       from '../../core/services/auth.service';
import { UserInfo }          from '../../core/models';

@Component({
  selector: 'app-profile',
  template: `  <div class="container page">    <div class="breadcrumb">      <a routerLink="/">Home</a><span class="breadcrumb-sep">›</span>      <span>My Profile</span>    </div>    <div class="section-header">      <h1 class="section-title">My Profile</h1>    </div>    <!-- ✅ Safe check -->    <div class="card" style="padding:32px;max-width:500px" *ngIf="user as u">      <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px">        <div class="nav-avatar"             style="width:64px;height:64px;font-size:28px;border-radius:50%;             background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center">          <!-- ✅ Safe access with fallback -->          {{ u.fullName?.charAt(0)?.toUpperCase() || '?' }}        </div>        <div>          <div style="font-size:20px;font-weight:700">            {{ u.fullName || 'N/A' }}          </div>          <div style="color:var(--text-3);font-size:14px">            {{ u.role || 'USER' }}          </div>        </div>      </div>      <div style="display:flex;flex-direction:column;gap:16px">        <div>          <div class="label">Email</div>          <div>{{ u.email || '-' }}</div>        </div>        <div>          <div class="label">Full Name</div>          <div>{{ u.fullName || '-' }}</div>        </div>        <div>          <div class="label">Account Type</div>          <div class="stock-badge stock-in">            {{ u.role || 'USER' }}          </div>        </div>      </div>      <div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap">        <a class="btn btn-outline btn-sm" routerLink="/orders">📋 View Orders</a>        <button class="btn btn-ghost btn-sm"                style="color:var(--error)"                (click)="logout()">🚪 Sign Out</button>      </div>    </div>    <!-- ✅ Optional fallback UI -->    <div *ngIf="!user" class="card" style="padding:24px">      User not logged in.    </div>  </div>  `,})

export class ProfileComponent implements OnInit {
  user: UserInfo | null = null;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
  }

  logout(): void {
    this.auth.logout();
  }
}
