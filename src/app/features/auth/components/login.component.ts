// src/app/features/auth/components/login.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./auth.component.scss'],
  template: `
    <div class="auth-wrap">
      <div class="auth-box">
        <div class="auth-logo">ShopPBP</div>
        <div class="auth-tagline">Premium eCommerce Platform</div>
        <h2 class="auth-title">Welcome back</h2>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              type="email"
              class="form-control"
              formControlName="email"
              placeholder="you@example.com"
            />

            <div
              class="form-error"
              *ngIf="form.get('email')?.invalid && form.get('email')?.touched"
            >
              Enter a valid email address
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              type="password"
              class="form-control"
              formControlName="password"
              placeholder="••••••••"
            />

            <div
              class="form-error"
              *ngIf="form.get('password')?.invalid && form.get('password')?.touched"
            >
              Password is required
            </div>
          </div>

          <div class="form-error" *ngIf="errorMsg">
            {{ errorMsg }}
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block btn-lg"
            [disabled]="loading || form.invalid"
            style="margin-top:20px"
          >
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-divider">or</div>

        <div class="auth-switch">
          Don't have an account?
          <a routerLink="/auth/register">Create one</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        const returnUrl =
          this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg =
          err?.error?.message || 'Invalid email or password';
      }
    });
  }
}
