// src/app/features/auth/components/register.component.ts
import { Component }   from '@angular/core';
import { FormBuilder,
         FormGroup,
         Validators }  from '@angular/forms';
import { Router }      from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';


import {
  ActivatedRoute,

  RouterModule
} from '@angular/router';
@Component({
  selector: 'app-register',
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
     styleUrls: ['./auth.component.scss'],
  template: `
  <div class="auth-wrap">
    <div class="auth-box">
      <div class="auth-logo">ShopPBP</div>
      <div class="auth-tagline">Join thousands of happy shoppers</div>
      <h2 class="auth-title">Create account</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">

        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-control"
                 formControlName="fullName"
                 placeholder="Siddharth Sharma"/>
          <div class="form-error"
               *ngIf="form.get('fullName')?.invalid && form.get('fullName')?.touched">
            Full name is required (min 2 characters)
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-control"
                 formControlName="email"
                 placeholder="you@example.com"/>
          <div class="form-error"
               *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
            Enter a valid email address
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-control"
                 formControlName="password"
                 placeholder="Min 8 chars — upper, lower, number, symbol"/>
          <div class="form-error"
               *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
            Password must be 8+ chars with uppercase, lowercase, number and symbol
          </div>
        </div>

        <div class="form-error" *ngIf="errorMsg">{{ errorMsg }}</div>

        <button type="submit"
                class="btn btn-primary btn-block btn-lg"
                [disabled]="loading || form.invalid"
                style="margin-top:20px">
          {{ loading ? 'Creating account…' : 'Create Account' }}
        </button>
      </form>

      <div class="auth-switch" style="margin-top:20px">
        Already have an account?
        <a routerLink="/auth/login">Sign in</a>
      </div>
    </div>
  </div>
  `,
})
export class RegisterComponent {

  form: FormGroup;
  loading  = false;
  errorMsg = '';

  private readonly PASSWORD_PATTERN =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  constructor(
    private fb:    FormBuilder,
    private auth:  AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required,
                      Validators.pattern(this.PASSWORD_PATTERN)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading  = true;
    this.errorMsg = '';

    this.auth.register(this.form.value).subscribe({
      next: () => {
        // FIX: reset loading before navigating
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: err => {
        this.loading  = false;
        this.errorMsg = err.error?.message || 'Registration failed. Try again.';
      },
    });
  }
}
