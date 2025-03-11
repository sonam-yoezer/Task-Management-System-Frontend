import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivate,

} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

/**
 * A guard service that protects routes by checking authentication status.
 * @class
 * @implements {CanActivate}
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

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
    return this.authService.validateToken().pipe(
      map(isValid => {
        if (isValid) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
