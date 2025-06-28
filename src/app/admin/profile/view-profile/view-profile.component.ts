import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';
import { MatDialog } from '@angular/material/dialog';

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
 * Represents the REST API response structure.
 * @interface RestResponse
 * @property {boolean} success - Indicates if the request was successful.
 * @property {string} [message] - Optional message describing the result.
 * @property {object} [data] - Optional data payload.
 * @property {User} [data.user] - The user object within the data payload.
 */
interface RestResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
  };
}

/**
 * Component for displaying and managing the current user's profile information.
 * Fetches user data from the API and allows editing via a dialog.
 * @class ViewProfileComponent
 * @implements {OnInit} - Angular lifecycle hook for initialization.
 */
@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.css']
})
export class ViewProfileComponent implements OnInit {

  /**
   * Stores the current user's information, or null if not available.
   * @type {User | null}
   * @default null
   */
  userInfo: User | null = null;

  /**
   * Indicates whether a loading operation (e.g., fetching user data) is in progress.
   * @type {boolean}
   * @default false
   */
  loading = false;

  /**
   * Stores an error message if the user data fetch fails, or null if no error.
   * @type {string | null}
   * @default null
   */
  error: string | null = null;

  /**
   * Creates an instance of ViewProfileComponent.
   * @constructor
   * @param {ApiService} apiService - Service for making HTTP requests to the backend API.
   * @param {ToastrService} toastr - Service for displaying toast notifications.
   * @param {Router} router - The Angular Router service for navigation between routes.
   * @param {MatDialog} dialog - Angular Material dialog service for opening edit dialogs.
   */
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  /**
   * Initializes the component after Angular has initialized the component's view.
   * Triggers the fetch of user information.
   * @method ngOnInit
   */
  ngOnInit(): void {
    this.fetchUserInfo();
  }

  /**
   * Fetches the current user's information from the API.
   * Handles authentication checks, API response parsing, and error scenarios.
   * Updates userInfo, loading, and error states accordingly.
   * @private
   */
  private fetchUserInfo(): void {
    this.loading = true;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.toastr.error('Please log in to continue');
      this.router.navigate(['/login']);
      this.loading = false;
      return;
    }
  
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  
    this.apiService.get<any>('/api/auth/self', { headers, observe: 'response' }).subscribe({

      next: (event) => {
        if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<any>; 
          const user = response.body?.data?.user || response.body?.user || response.body;
          if (user && user.id) { // Check if it’s a valid User object
            this.userInfo = user;
          } else {
            this.error = response.body?.message || 'No user data received';
            this.toastr.error();
          }
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = error.statusText || 'Failed to connect to server';
        this.loading = false;
        this.toastr.error('Failed to fetch user information');
        if (error.status === 401) {
          this.toastr.error('Session expired. Please log in again.');
          localStorage.removeItem('accessToken');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /**
   * Fetches the current user's information from the API.
   * Handles authentication checks, API response parsing, and error scenarios.
   * Updates userInfo, loading, and error states accordingly.
   * @private
   */
  openEditDialog(profile: User): void {
    const dialogRef = this.dialog.open(EditProfileComponent, {
      width: '800px',
      data: profile
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchUserInfo(); // Refresh the theatre list
      }
    });
  }

}
