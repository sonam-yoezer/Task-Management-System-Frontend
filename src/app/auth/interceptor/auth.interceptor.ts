import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginResponseModel } from '../../models/login.model';

/**
 * Intercepts HTTP requests to add an Authorization header with a Bearer token.
 * Handles 401 errors by attempting to refresh the token and retrying the request.
 * If refresh fails or is already in progress, logs out the user and redirects to login.
 * @function authInterceptor
 * @param {HttpRequest<any>} req - The outgoing HTTP request to intercept.
 * @param {HttpHandlerFn} next - The next handler in the HTTP request pipeline.
 * @returns {Observable<HttpEvent<any>>} An Observable of the HTTP event stream, including the response or error.
 * @throws {Error} Propagates HTTP errors or token refresh errors if they cannot be handled.
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const refreshTokenInProgress = new BehaviorSubject<boolean>(false);

  /**
   * List of API endpoints excluded from token attachment and refresh logic.
   * @type {string[]}
   */
  const excludedUrls = ['/auth/refresh', '/auth/login', '/auth/signup'];
  if (excludedUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  const token = authService.getToken();
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 && !refreshTokenInProgress.value) {
        console.log('401 detected, attempting token refresh');
        refreshTokenInProgress.next(true);
        return authService.refreshToken().pipe(
          switchMap((newTokenResponse: LoginResponseModel) => {
            console.log('Token refreshed, retrying request with:', newTokenResponse.accessToken);
            refreshTokenInProgress.next(false);
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newTokenResponse.accessToken}`
              }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            console.error('Token refresh failed:', refreshError);
            refreshTokenInProgress.next(false);
            authService.logout();
            router.navigate(['/login'], { queryParams: { sessionExpired: true } });
            return throwError(() => refreshError);
          })
        );
      } else if (error.status === 401) {
        console.log('Refresh already in progress, waiting or failing');
        return throwError(() => error);
      }
      return throwError(() => error);
    })
  );
};
