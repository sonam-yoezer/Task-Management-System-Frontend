import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastrModule, ToastrService } from 'ngx-toastr';

/**
 * Represents a user entity with basic profile information.
 * @interface User
 * @property {string} id - The unique identifier of the user.
 * @property {string} firstName - The user's first name.
 * @property {string} lastName - The user's last name.
 * @property {string} email - The user's email address.
 * @property {string} role - The user's role (e.g., 'admin', 'user').
 */
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

/**
 * Component for rendering the user dashboard UI.
 * Manages user profile display, sidebar toggling, and logout functionality.
 * @class UserdashboardComponent
 */
@Component({
  selector: 'app-userdashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastrModule],
  templateUrl: './userdashboard.component.html',
  styleUrl: './userdashboard.component.css'
})
export class UserdashboardComponent {

  /**
   * Indicates whether a loading operation (e.g., logout) is in progress.
   * @type {boolean}
   * @default false
   */
  loading = false;

  /**
   * An Observable stream that emits the current authenticated user or null if no user is authenticated.
   * @type {Observable<User | null>}
   */
  currentUser$: Observable<User | null>;

  /**
   * Indicates whether the profile dropdown menu is open.
   * @type {boolean}
   * @default false
   */
  isProfileMenuOpen = false;

  /**
   * Indicates whether the sidebar is expanded (true) or collapsed (false).
   * @type {boolean}
   * @default false
   */
  isSidebarOpen = false;

  /**
   * Stores the current user's information, or null if not available.
   * @type {User | null}
   * @default null
   */
  userInfo: User | null = null;

  /**
   * Reference to the profile menu DOM element for click-outside detection.
   * @type {ElementRef}
   */
  @ViewChild('profileMenu', { static: false }) profileMenu!: ElementRef;


  /**
   * Creates an instance of UserdashboardComponent.
   * Initializes the currentUser$ Observable to track the authenticated user.
   * @constructor
   * @param {Router} router - The Angular Router service for navigation between routes.
   * @param {AuthService} authService - The authentication service for managing user state.
   * @param {ToastrService} toastr - The Toastr service for displaying toast notifications.
   */
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) { this.currentUser$ = this.authService.getCurrentUser(); }

  /**
     * Asynchronously logs out the current user and redirects to the login page.
     * Sets loading state during the operation and displays success or error notifications.
     * @async
     * @returns {Promise<void>} A promise that resolves when the logout operation and navigation are complete.
     * @throws {Error} If the logout operation fails, an error is logged and a toast notification is displayed.
     */
  async logout(): Promise<void> {
    try {
      this.loading = true;
      await this.authService.logout();
      await this.router.navigate(['/login']); // Added await for navigation completion
      this.toastr.success('You have been logged out successfully', 'Logout Successful'); // Success message
    } catch (error) {
      console.error('Logout error:', error); // Log error for debugging
      this.toastr.error('Failed to logout. Please try again.', 'Logout Error'); // Error message with Toastr
    } finally {
      this.loading = false;
    }
  }

  /**
   * Toggles the visibility of the profile dropdown menu.
   * Prevents event bubbling to ensure the menu stays open when clicked.
   * @param {Event} event - The DOM event triggered by clicking the profile button.
   */
  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  /**
   * Closes the profile dropdown menu when clicking outside of it.
   * Listens to document-level click events and checks if the click occurred outside the profile menu.
   * @param {Event} event - The DOM click event from the document.
   * @listens document:click
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isProfileMenuOpen && this.profileMenu && !this.profileMenu.nativeElement.contains(event.target)) {
      this.isProfileMenuOpen = false;
    }
  }

  /**
   * Toggles the sidebar between expanded and collapsed states.
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

}
