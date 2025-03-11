import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admindashboard',
  standalone: true,
  imports: [],
  templateUrl: './admindashboard.component.html',
  styleUrl: './admindashboard.component.css'
})
export class AdmindashboardComponent {

  /**
   * Indicates whether a loading operation is in progress.
   * @type {boolean}
   */
  loading = false;

  /**
   * An Observable stream that emits the current authenticated user or null if no user is authenticated.
   * @type {Observable<User | null>}
   */
  currentUser$: Observable<User | null>;

  /**
   * Creates an instance of the component/service.
   * @param {Router} router - The Angular Router service for navigation.
   * @param {AuthService} authService - The authentication service for managing user state.
   */
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    this.currentUser$ = this.authService.getCurrentUser();
  }

  /**
   * Asynchronously logs out the current user and redirects to the login page.
   * Sets loading state during the operation and handles any errors that occur.
   * @async
   * @returns {Promise<void>} A promise that resolves when the logout operation is complete
   * @throws {Error} If the logout operation fails
   */
  async logout() {
    try {
      this.loading = true;
      await this.authService.logout();

      this.router.navigate(['/login']);
    } catch (error) {
      alert('Failed to logout. Please try again.');
    } finally {
      this.loading = false;
    }
  }

}
