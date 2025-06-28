import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { SubmitAssignedTaskComponent } from '../submit-assigned-task/submit-assigned-task.component';
import { ToastrService } from 'ngx-toastr';

/**
 * Component to display all tasks assigned to the currently logged-in user.
 * 
 * Features:
 * - Fetches assigned tasks from the backend using the user's access token.
 * - Handles loading states, API errors, and token validation.
 * - Opens a dialog to submit a task with remarks and file upload.
 * - Refreshes the task list after a successful submission.
 * 
 * @component
 */
@Component({
  selector: 'app-view-assigned-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-assigned-task.component.html',
  styleUrls: ['./view-assigned-task.component.css']
})
export class ViewAssignedTaskComponent {
  tasks: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private dialog: MatDialog,
    private toastr: ToastrService,
  ) { }

  /**
 * Angular lifecycle hook called on component initialization.
 * Starts fetching the assigned tasks.
 */
  ngOnInit(): void {
    console.log('ngOnInit called');
    this.getAssignedTasks();
  }


  /**
   * Fetches all tasks assigned to the currently authenticated user.
   * Validates the access token, handles API response and errors.
   */
  getAssignedTasks() {
    this.loading = true;
    this.error = null;

    const token = localStorage.getItem('accessToken'); // Correct key
    console.log('Token from localStorage:', token);

    if (!token) {
      this.error = 'User is not authenticated. Please login.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.apiService.get<any>('/api/assign/user-tasks', { headers, observe: 'response' })
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.Response) {
            const response = event as HttpResponse<any>;

            if (response.status === 200) {
              // Assuming your backend returns an array directly
              this.tasks = response.body;
              this.loading = false;
            } else {
              this.error = 'Unexpected response status: ' + response.status;
              this.loading = false;
            }
          }
        },
        error: (err) => {
          console.error('Error fetching tasks:', err);

          // Try to get a proper error message from response body or fallback
          if (err.error && typeof err.error === 'object') {
            this.error = err.error.message || 'Failed to load tasks.';
          } else if (typeof err.error === 'string') {
            // If error is string, it might be HTML or something else
            this.error = 'Failed to load tasks.';
          } else {
            this.error = 'Failed to load tasks.';
          }

          this.loading = false;

          // Optional: handle auth errors globally or here
          if (err.status === 401) {
            this.error = 'Session expired. Please login again.';
            localStorage.removeItem('accessToken');
            // Redirect user to login page if you inject Router
            // this.router.navigate(['/login']);
          }
        }
      });
  }

  /**
   * Placeholder method to refresh the task list.
   * Can be implemented later to reload the tasks without page reload.
   */
  fetchTasks(): void {
    this.getAssignedTasks(); // You can simply call getAssignedTasks here to refresh.
  }

  /**
 * Opens a dialog to submit a selected task.
 * 
 * @param {number} assignmentId - The ID of the task to submit.
 */
  submitTask(assignmentId: number) {
    const dialogRef = this.dialog.open(SubmitAssignedTaskComponent, {
      width: '500px',
      disableClose: true,
      data: { assignmentId } // Pass the ID to the dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchTasks(); // Refresh task list
        this.toastr.success('Task submitted successfully');
      }
    });
  }
}
