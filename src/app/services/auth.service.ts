import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { LoginModel, LoginResponseModel } from '../models/login.model';
import { User } from '../models/user.model';
import { UserService } from './user.service';

/**
 * Service for handling authentication and authorization logic.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private TOKEN_KEY = 'access_token';
  private REFRESH_TOKEN_KEY = 'refresh_token';
  private ROLE_KEY = 'user_role';

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private router: Router
  ) { }

  /**
   * Stores the access token in local storage.
   * @param {string} token - The access token.
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Retrieves the refresh token from local storage.
   * @returns {string | null} - The refresh token or null if not found.
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Stores the user role in local storage.
   * @param {string} role - The user role.
   */
  setRoles(role: string): void {
    localStorage.setItem(this.ROLE_KEY, role);
  }

   /**
   * Retrieves the access token from local storage.
   * @returns {string | null} - The access token or null if not found.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
 * Retrieves the refresh token stored in local storage.
 * @returns {string | null} The stored refresh token, or null if not found.
 */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Retrieves the stored user role from local storage.
   * @returns {string | null} - The user role or null if not found.
   */
  getRoles(): string | null {
    const role = localStorage.getItem(this.ROLE_KEY);
    return role;
  }

  /**
   * Removes the stored user role from local storage.
   */
  removeRoles(): void {
    localStorage.removeItem(this.ROLE_KEY);
  }

  /**
   * Removes the access token from local storage.
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Removes the refresh token from local storage.
   */
  removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
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
        this.setToken(response.access_token);
        this.setRefreshToken(response.refresh_token);

        // Store role if present
        if (response.role) {
          this.setRoles(response.role);
        }

        // Fetch user details immediately after login
        this.getCurrentUser().subscribe(); // You might want to handle this better to avoid multiple requests
      }),
      map((response: any) => ({
        accessToken: response.access_token,
        refreshToken: response.refresh_token
      })),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

   /**
   * Retrieves the currently authenticated user's details.
   * @returns {Observable<User>} - Observable containing the user details.
   */
  getCurrentUser(): Observable<User> {
    return this.apiService.get<{ status: boolean, data: { user: User } }>('/auth/self').pipe(
      map((response: any) => {

        const user: User = response.user;
        this.userService.setCurrentUser(user);

        return user;  // Ensure returning a valid 'User' object
      }),
      catchError((error) => {
        if (error.status === 403) {
          this.router.navigate(['/login']);
        }
        return throwError(() => error);  // Re-throw the error
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
