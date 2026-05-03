import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
export const authGuard: CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

 // const user = auth['userSubject']?.value; // or expose getter
 //const user = auth.userValue;
 const user = true
  if (user) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

