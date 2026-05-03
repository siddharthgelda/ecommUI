// src/app/core/services/auth.service.ts
import { Injectable }                               from '@angular/core';
import { HttpClient, HttpHeaders }                  from '@angular/common/http';
import { BehaviorSubject, Observable, tap }         from 'rxjs';
import { Router }                                   from '@angular/router';
import { environment }                              from '../../../environments/environment';
import { AuthResponse, LoginRequest,
         RegisterRequest, UserInfo }                from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly BASE = environment.authServiceUrl;

  private readonly KEYS = {
    ACCESS:  'pbp_access_token',
    REFRESH: 'pbp_refresh_token',
    USER:    'pbp_user',
  };

  private currentUser$ = new BehaviorSubject<UserInfo | null>(
    this.loadStoredUser()
  );

  /** Emits the current logged-in user (or null if logged out) */
  user$ = this.currentUser$.asObservable();

  constructor(
    private http:   HttpClient,
    private router: Router,
  ) {}

  // ── Register ──────────────────────────────────────────────────

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.BASE}/auth/register`, req)
      .pipe(tap(res => this.persistSession(res)));
  }

  // ── Login ─────────────────────────────────────────────────────

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.BASE}/auth/login`, req)
      .pipe(tap(res => this.persistSession(res)));
  }

  // ── Refresh token ─────────────────────────────────────────────

  refreshToken(): Observable<AuthResponse> {
    const refresh = localStorage.getItem(this.KEYS.REFRESH) ?? '';
    return this.http
      .post<AuthResponse>(
        `${this.BASE}/auth/refresh`,
        {},
        { headers: new HttpHeaders({ 'X-Refresh-Token': refresh }) },
      )
      .pipe(tap(res => this.persistSession(res)));
  }

  // ── Logout ────────────────────────────────────────────────────

  logout(): void {
    const token   = this.getAccessToken();
    const refresh = localStorage.getItem(this.KEYS.REFRESH) ?? '';

    if (token) {
      const headers = new HttpHeaders({
        Authorization:     `Bearer ${token}`,
        'X-Refresh-Token': refresh,
      });
      // Fire-and-forget — clear storage regardless of response
      this.http
        .post(`${this.BASE}/auth/logout`, {}, { headers })
        .subscribe({ error: () => {} });
    }

    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  // ── Getters ───────────────────────────────────────────────────

  getAccessToken(): string | null {
    return localStorage.getItem(this.KEYS.ACCESS);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.KEYS.REFRESH);
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUser$.getValue();
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ADMIN';
  }

  isCustomer(): boolean {
    return this.getCurrentUser()?.role === 'CUSTOMER';
  }

  // ── Private helpers ───────────────────────────────────────────

  private persistSession(res: AuthResponse): void {
    localStorage.setItem(this.KEYS.ACCESS,  res.accessToken);
    localStorage.setItem(this.KEYS.REFRESH, res.refreshToken);
    localStorage.setItem(this.KEYS.USER,    JSON.stringify(res.user));
    this.currentUser$.next(res.user);
  }

  private clearSession(): void {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
    this.currentUser$.next(null);
  }

  private loadStoredUser(): UserInfo | null {
    try {
      const raw = localStorage.getItem(this.KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
