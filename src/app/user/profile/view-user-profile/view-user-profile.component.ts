import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { EditUserProfileComponent } from '../edit-user-profile/edit-user-profile.component';
import Swal from 'sweetalert2';

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
 * Component for viewing and managing the current user's profile.
 * Fetches user data, allows editing via a dialog, and provides deletion functionality with confirmation.
 * @class ViewUserProfileComponent
 * @implements {OnInit} - Angular lifecycle hook for initialization.
 */
@Component({
  selector: 'app-view-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-user-profile.component.html',
  styleUrl: './view-user-profile.component.css'
})
export class ViewUserProfileComponent implements OnInit {

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
   * Creates an instance of ViewUserProfileComponent.
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
  ) { }

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
   * Opens a dialog to edit the user's profile.
   * Refreshes the user information if the dialog returns a successful update.
   * @param {User} profile - The user profile to edit.
   */
  openEditDialog(profile: User): void {
    const dialogRef = this.dialog.open(EditUserProfileComponent, {
      width: '800px',
      data: profile
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchUserInfo(); // Refresh the theatre list
      }
    });
  }

  /**
   * Deletes the user's profile after confirmation via a SweetAlert2 dialog.
   * Sends a DELETE request to the API and refreshes the user info on success.
   * @param {User} profile - The user profile to delete.
   */
  deleteProfile(profile: User): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete ${profile.firstName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1B355E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        };

        // Specify responseType as text
        this.apiService.delete(`/user/${profile.id}`, {
          headers,
          responseType: 'text'
        }).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Deleted!',
              text: 'User has been deleted successfully.',
              icon: 'success',
              confirmButtonColor: '#1B355E'
            });
            this.fetchUserInfo(); // Refresh the list
          },
          error: (error) => {
            // Check if it's actually a successful response
            if (error.status === 200) {
              Swal.fire({
                title: 'Deleted!',
                text: 'User has been deleted successfully.',
                icon: 'success',
                confirmButtonColor: '#1B355E'
              });
              this.fetchUserInfo(); // Refresh the list
            } else {
              Swal.fire({
                title: 'Error!',
                text: error.error?.message || 'Failed to delete user',
                icon: 'error',
                confirmButtonColor: '#1B355E'
              });
            }
          }
        });
      }
    });
  }
}
