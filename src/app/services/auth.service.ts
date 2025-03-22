import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { LoginModel, LoginResponseModel } from '../models/login.model';
import { User } from '../models/user.model';
import { UserService } from './user.service';
import { isPlatformBrowser } from '@angular/common';

/**
 * Service for handling authentication and authorization logic.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private TOKEN_KEY = 'accessToken';
  private REFRESH_TOKEN_KEY = 'refreshToken';
  private ROLE_KEY = 'userRole';

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  /**
   * Utility to safely access localStorage.
   */
  private safeLocalStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  /**
   * Stores the access token in local storage.
   * @param {string} token - The access token.
   */
  setToken(token: string): void {
    this.safeLocalStorage()?.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Retrieves the refresh token from local storage.
   * @returns {string | null} - The refresh token or null if not found.
   */
  setRefreshToken(token: string): void {
    this.safeLocalStorage()?.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Stores the user role in local storage.
   * @param {string} role - The user role.
   */
  setRoles(role: string): void {
    this.safeLocalStorage()?.setItem(this.ROLE_KEY, role);
  }

  /**
  * Retrieves the access token from local storage.
  * @returns {string | null} - The access token or null if not found.
  */
  getToken(): string | null {
    return this.safeLocalStorage()?.getItem(this.TOKEN_KEY) || null;
  }

  /**
 * Retrieves the refresh token stored in local storage.
 * @returns {string | null} The stored refresh token, or null if not found.
 */
  getRefreshToken(): string | null {
    return this.safeLocalStorage()?.getItem(this.REFRESH_TOKEN_KEY) || null;
  }

  /**
   * Retrieves the stored user role from local storage.
   * @returns {string | null} - The user role or null if not found.
   */
  getRoles(): string | null {
    return this.safeLocalStorage()?.getItem(this.ROLE_KEY) || null;
  }

  /**
   * Removes the stored user role from local storage.
   */
  removeRoles(): void {
    this.safeLocalStorage()?.removeItem(this.ROLE_KEY);
  }

  /**
   * Removes the access token from local storage.
   */
  removeToken(): void {
    this.safeLocalStorage()?.removeItem(this.TOKEN_KEY);
  }

  /**
   * Removes the refresh token from local storage.
   */
  removeRefreshToken(): void {
    this.safeLocalStorage()?.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
 * Validates the current access token.
 * @returns {Observable<boolean>} - Observable indicating whether the token is valid.
 */
  validateToken(): Observable<boolean> {
    return this.apiService.get('/auth/self').pipe(
      map(() => true),
      catchError(() => {
        console.warn('Token validation failed.');
        return of(false);
      })
    );
  }

  /**
  * Logs in the user and stores authentication tokens.
  * @param {LoginModel} loginData - The user's login credentials.
  * @returns {Observable<LoginResponseModel>} - Observable containing authentication tokens.
  */
  login(loginData: LoginModel): Observable<LoginResponseModel> {
    return this.apiService.post<LoginResponseModel>('/auth/login', loginData).pipe(
      tap((response: any) => {
        if (!response.access_token) {
          throw new Error('Invalid login response: missing access_token');
        }
        this.setToken(response.access_token);
        this.setRefreshToken(response.refresh_token);
        if (response.role) {
          this.setRoles(response.role);
        }
        this.getCurrentUser().subscribe({
        });
      }),
      map((response: any) => ({
        accessToken: response.access_token,
        refreshToken: response.refresh_token
      })),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
  * Retrieves the currently authenticated user's details.
  * @returns {Observable<User>} - Observable containing the user details.
  */
  getCurrentUser(): Observable<User> {
    return this.apiService.get<any>('/auth/self').pipe(
      map((response: any) => {
        const user: User = response.data?.user || response.user || response;
        if (!user) {
          throw new Error('Invalid user response');
        }
        this.userService.setCurrentUser(user);
        return user;
      }),
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  /**
  * Refreshes the authentication token using the stored refresh token.
  * @returns {Observable<LoginResponseModel>} - Observable containing new authentication tokens.
  */
  refreshToken(): Observable<LoginResponseModel> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiService.post<LoginResponseModel>('/auth/refresh', null, {
      headers: { 'Authorization': `Bearer ${refreshToken}` }
    }).pipe(
      tap((response: any) => {
        if (!response.access_token || !response.refresh_token) {
          throw new Error('Invalid token response');
        }

        this.setToken(response.access_token);
        this.setRefreshToken(response.refresh_token);
      }),
      map((response: any) => ({
        accessToken: response.access_token,
        refreshToken: response.refresh_token
      })),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Logs out the user by clearing authentication data.
   */
  logout(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeRoles();
    this.router.navigate(['/login']);
  }

  /**
  * Initiates a password reset request.
  * @param {string} email - The user's email address.
  * @returns {Observable<any>} - Observable for the request.
  */
  forgotPassword(email: string): Observable<any> {
    return this.apiService.post('/auth/forgot-password', { email });
  }

  /**
 * Resets the user's password using a token.
 * @param {string} token - The password reset token.
 * @param {string} password - The new password.
 * @returns {Observable<any>} - Observable for the request.
 */
  resetPassword(token: string, password: string): Observable<any> {
    return this.apiService.post('/auth/reset-password', { token, password });
  }
}
