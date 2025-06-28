import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { User } from '../../../models/user.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { EditTeamsDetailsComponent } from '../edit-teams-details/edit-teams-details.component';

/**
 * Represents the REST API response structure.
 * @interface RestResponse
 * @property {boolean} success - Indicates if the request was successful.
 * @property {string} [message] - Optional message describing the result.
 */
interface RestResponse {
  success: boolean;
  message?: string;
}

/**
 * Component for displaying and managing a list of team users.
 * Provides search functionality, user data fetching, and editing capabilities via a dialog.
 * @class ViewTeamsDetailsComponent
 * @implements {OnInit} - Angular lifecycle hook for initialization.
 */
@Component({
  selector: 'app-view-teams-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './view-teams-details.component.html',
  styleUrl: './view-teams-details.component.css'
})
export class ViewTeamsDetailsComponent implements OnInit {

  /**
   * Array of all users fetched from the API.
   * @type {User[]}
   * @default []
   */
  user: User[] = [];

  /**
   * Indicates whether a loading operation (e.g., fetching users) is in progress.
   * @type {boolean}
   * @default false
   */
  loading = false;

  /**
   * Stores an error message if the user fetch fails, or null if no error.
   * @type {string | null}
   * @default null
   */
  error: string | null = null;

  /**
   * The current search term entered by the user.
   * @type {string}
   * @default ''
   */
  searchTerm: string = '';

  /**
   * Array of users filtered based on the search term.
   * @type {User[]}
   * @default []
   */
  filteredUsers: User[] = [];

  /**
   * Subject for handling search term changes with debouncing and distinct checks.
   * @type {Subject<string>}
   */
  searchTermSubject: Subject<string> = new Subject<string>();

  /**
   * Creates an instance of ViewTeamsDetailsComponent.
   * @constructor
   * @param {ApiService} apiService - Service for making HTTP requests to the backend API.
   * @param {ToastrService} toastr - Service for displaying toast notifications.
   * @param {MatDialog} dialog - Angular Material dialog service for opening edit dialogs.
   */
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }

  /**
   * Initializes the component after Angular has initialized the component's view.
   * Sets up the search subscription and fetches initial user data.
   * @method ngOnInit
   */
  ngOnInit(): void {
    // Set up search subscription
    this.searchTermSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm = term;
        this.filteredUsers = this.filterUser();
      });

    // Fetch initial data
    this.fetchUser();
  }

  /**
   * Fetches the list of users from the API.
   * Updates user and filteredUsers arrays, and handles loading and error states.
   * @private
   */
  private fetchUser(): void {
    this.loading = true;
    this.error = null;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.get<User[]>('/api/user/getAllUser', { headers, observe: 'response' }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<User[]>;
          if (response.body) {
            this.user = response.body;
            this.filteredUsers = [...this.user]; // Initialize filteredUsers with fetched data
          }
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = error.message || 'Failed to fetch user';
        this.loading = false;
        this.toastr.error('Failed to fetch User details');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
    * Filters the user list based on the current search term.
    * Searches by firstName in a case-insensitive manner.
    * @returns {User[]} An array of users matching the search term, or all users if no term is provided.
    */
  filterUser(): User[] {
    if (!this.searchTerm) {
      return [...this.user]; // Return a copy of all users if no search term
    }

    return this.user.filter(user =>
      user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  /**
     * Refreshes the user list by re-fetching data from the API.
     */
  refreshUser(): void {
    this.fetchUser();
  }

  /**
   * Opens a dialog to edit a user's details.
   * Refreshes the user list if the dialog returns a successful update.
   * @param {User} profile - The user profile to edit.
   */
  openEditDialog(profile: User): void {
    const dialogRef = this.dialog.open(EditTeamsDetailsComponent, {
      width: '800px',
      data: profile
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchUser(); // Refresh the list
      }
    });
  }

}
