import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * AdminAuthGuard (Placeholder)
 * 
 * Guards admin routes under `/admin/*`. Currently allows access for development.
 * Future integration will verify admin authentication tokens, session expiry,
 * and role-based access control (RBAC).
 */
export const adminAuthGuard: CanActivateFn = (route, state) => {
  // Placeholder: In production, check auth service:
  // const authService = inject(AuthService);
  // const router = inject(Router);
  // if (!authService.isAdminAuthenticated()) {
  //   return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  // }
  
  // For now, allow direct access to admin module:
  return true;
};
