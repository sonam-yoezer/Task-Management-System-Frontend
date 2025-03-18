import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,

} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

/**
 * A guard service that protects routes by checking authentication status.
 * @class
 * @implements {CanActivate}
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private isAuthenticated: boolean | null = null;

  /**
   * Creates an instance of AuthGuard.
   * @param {AuthService} authService - Service for authentication operations
   * @param {Router} router - Router service for navigation
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  /**
   * Determines if a route can be activated based on token validation.
   * Redirects to login page if authentication fails.
   * @param {ActivatedRouteSnapshot} route - The route being navigated to
   * @param {RouterStateSnapshot} state - The current router state
   * @returns {Observable<boolean>} An Observable that resolves to true if access is allowed, false otherwise
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const token = this.authService.getToken();
    if (!token) {
      console.log('No token, skipping validation, redirecting to login');
      this.isAuthenticated = false;
      this.router.navigate(['/login']);
      return of(false);
    }

    // Use cached result if available
    if (this.isAuthenticated !== null) {
      console.log('Using cached auth state:', this.isAuthenticated);
      return of(this.isAuthenticated ? true : (this.router.navigate(['/login']), false));
    }

    return this.authService.validateToken().pipe(
      map(isValid => {
        this.isAuthenticated = isValid;
        console.log('Validated token, result:', isValid);
        if (isValid) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError(() => {
        this.isAuthenticated = false;
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }

}
