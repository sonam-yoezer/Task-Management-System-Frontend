import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api.service';

/**
 * Component for displaying a dialog to add and assign tasks to users.
 * Fetches user and work lists from the backend and submits task assignment requests.
 */
@Component({
  selector: 'app-add-task-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-task-dialog.component.html',
  styleUrl: './add-task-dialog.component.css'
})
export class AddTaskDialogComponent implements OnInit {
  taskForm: FormGroup;
  submitted = false;

  users: any[] = [];
  works: any[] = [];

  /**
   * Creates an instance of AddTaskDialogComponent.
   * 
   * @param fb - FormBuilder service to create reactive forms.
   * @param apiService - Custom API service to make HTTP requests.
   * @param toastr - Toastr service for displaying notifications.
   * @param dialogRef - Reference to the Angular Material dialog.
   */
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AddTaskDialogComponent>
  ) {
    this.taskForm = this.fb.group({
      userId: [null, Validators.required],
      workId: [null, Validators.required],
      dateline: ['', Validators.required],
      description: [null, Validators.required]
    });
  }

  /**
     * Lifecycle hook that initializes user and work lists.
     */
  ngOnInit(): void {
    this.fetchUsers();
    this.fetchWorks();
  }

  /**
   * Getter for easy access to form controls.
   */
  get f() {
    return this.taskForm.controls;
  }

  /**
   * Fetches all users eligible for task assignment from the backend.
   * Displays an error message if the API call fails.
   */
  fetchUsers() {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.get<any[]>('/api/assign/userList', { headers }).subscribe({
      next: (response: any) => {
        this.users = response;
      },
      error: () => {
        this.toastr.error('Failed to fetch user list');
      }
    });
  }

  /**
   * Fetches all available work items from the backend.
   * Displays an error message if the API call fails.
   */
  fetchWorks() {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.get<any[]>('/api/assign/workList', { headers }).subscribe({
      next: (response: any) => {
        this.works = response;
      },
      error: () => {
        this.toastr.error('Failed to fetch work list');
      }
    });
  }

  /**
   * Handles form submission for task assignment.
   * Sends the form data to the backend and displays appropriate success or error messages.
   */
  onSubmit() {
    this.submitted = true;

    if (this.taskForm.invalid) {
      return;
    }

    const payload = this.taskForm.value;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.post('/api/assign/assignTask', payload, { headers }).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.toastr.success('Task assigned successfully');
          this.dialogRef.close(true);
        } else if (response && !response.success) {
          this.toastr.error(response.message || 'Failed to assign task');
        } else {
          this.toastr.error('Unexpected response from server');
        }
      },
      error: (error) => {
        console.error('Assignment Error:', error);
        const errorMessage = error?.error?.message || 'An unexpected error occurred.';
        this.toastr.error(errorMessage);
      }
    });
  }

  /**
   * Cancels the task assignment process and closes the dialog.
   * Resets the form and clears the submission state.
   * 
   * @param event - Optional MouseEvent to handle backdrop click or button click.
   */
  onCancel(event?: MouseEvent): void {
    if (event?.target === event?.currentTarget || !event) {
      this.submitted = false;
      this.taskForm.reset();
      this.dialogRef.close();
    }
  }
  
}
