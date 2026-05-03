// src/app/core/guards/auth.guard.ts
import { inject }    from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService }           from '../services/auth.service';

/**
 * Functional guard — protects routes that require a logged-in user.
 * Redirects to /auth/login with returnUrl if not authenticated.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Functional guard — protects admin-only routes.
 */
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;

  router.navigate(['/']);
  return false;
};
