import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Work } from '../../../models/work.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { AddWorkDialogComponent } from '../add-work-dialog/add-work-dialog.component';
import { EditWorkDialogComponent } from '../edit-work-dialog/edit-work-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-work',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './view-work.component.html',
  styleUrl: './view-work.component.css'
})
export class ViewWorkComponent implements OnInit {
  /** List of filtered work items based on search */
  filteredWorks: Work[] = [];

  /** List of all work items */
  work: Work[] = [];

  /** Search term for filtering work items */
  searchTerm: string = '';

  /** Flag to indicate loading state */
  loading = false;

  /** Error message for API requests */
  error: string | null = null;

  /** Subject to handle search term debouncing */
  searchTermSubject: Subject<string> = new Subject<string>();

  /**
   * Constructor to initialize dependencies.
   * @param {ApiService} apiService - Service to interact with the API.
   * @param {ToastrService} toastr - Service for toast notifications.
   * @param {MatDialog} dialog - Service for opening dialogs.
   */
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }

  /**
   * Lifecycle hook that runs on component initialization.
   * Sets up the search subscription and fetches initial work data.
   */
  ngOnInit(): void {
    // Set up search subscription
    this.searchTermSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm = term;
        this.filteredWorks = this.filterWork();
      });

    // Fetch initial data
    this.fetchWork();
  }

  /**
   * Opens a dialog to add a new work item.
   * Refreshes the list upon successful addition.
   */
  openAddWorkDialog() {
    const dialogRef = this.dialog.open(AddWorkDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the theatres list after adding
        this.fetchWork();
        this.toastr.success('Work added successfully');
      }
    });
  }

  /**
   * Fetches the list of work items from the API.
   * Handles loading states and errors.
   */
  private fetchWork(): void {
    this.loading = true;
    this.error = null;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.get<Work[]>('/work', { headers, observe: 'response' }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<Work[]>;
          if (response.body) {
            this.work = response.body;
            this.filteredWorks = [...this.work]; // Initialize filteredUsers with fetched data
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
   * Filters work items based on the search term.
   * @returns {Work[]} The filtered list of work items.
   */
  filterWork(): Work[] {
    if (!this.searchTerm) {
      return [...this.work]; // Return a copy of all users if no search term
    }

    return this.work.filter(work =>
      work.workName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  /**
   * Opens a dialog to edit a work item.
   * Refreshes the list upon successful edit.
   * @param {Work} profile - The work item to be edited.
   */
  openEditDialog(profile: Work): void {
    const dialogRef = this.dialog.open(EditWorkDialogComponent, {
      width: '800px',
      data: profile
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchWork(); // Refresh the list
      }
    });
  }

  /**
 * Deletes a work item after user confirmation.
 * @param {Work} work - The work item to be deleted.
 */
  deleteWork(work: Work): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete ${work.workName}?`,
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
        this.apiService.delete(`/work/${work.id}`, {
          headers,
          responseType: 'text'
        }).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Work has been deleted successfully.',
              icon: 'success',
              confirmButtonColor: '#1B355E'
            });
            this.fetchWork(); // Refresh the list
          },
          error: (error) => {
            // Check if it's actually a successful response
            if (error.status === 200) {
              Swal.fire({
                title: 'Deleted!',
                text: 'Work has been deleted successfully.',
                icon: 'success',
                confirmButtonColor: '#1B355E'
              });
              this.fetchWork(); // Refresh the list
            } else {
              Swal.fire({
                title: 'Error!',
                text: error.error?.message || 'Failed to delete work',
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
