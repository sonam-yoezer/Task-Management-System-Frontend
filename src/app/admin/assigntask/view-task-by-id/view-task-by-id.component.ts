import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/**
 * Component for viewing the details of a specific task by ID.
 * 
 * Features:
 * - Fetches task details using the provided assignment ID.
 * - Allows the admin to approve or reject the task with remarks.
 * - Shows success or error notifications.
 * - Closes the dialog on action completion or failure.
 * 
 * Dialog Data:
 * - Receives the task ID via Angular Material dialog data injection.
 * 
 * @component
 */
@Component({
  selector: 'app-view-task-by-id',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './view-task-by-id.component.html',
  styleUrl: './view-task-by-id.component.css'
})
export class ViewTaskByIdComponent implements OnInit {
  /** Holds the fetched task details */
  task: any;

  /** Admin's remarks for approval or rejection */
  remarks: string = '';

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<ViewTaskByIdComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string }
  ) { }

  /**
   * Lifecycle hook that runs after component initialization.
   * Automatically fetches task details based on the provided ID.
   */
  ngOnInit(): void {
    this.getTaskById(this.data.id);
  }

  /**
 * Fetches the task details from the backend using the task ID.
 * 
 * @param {string} id - The ID of the task to retrieve.
 */
  getTaskById(id: string) {
    this.apiService.get(`/api/assign/task/${id}`).subscribe({
      next: (response) => {
        this.task = response;
      },
      error: () => {
        this.toastr.error('Failed to load task details');
        this.dialogRef.close(); // Close the dialog if fetch fails
      }
    });
  }

  /**
   * Approves the current task.
   * Requires admin remarks to proceed.
   * Sends the approval request to the backend and handles the response.
   */
  approveTask() {
    if (!this.remarks.trim()) {
      this.toastr.error('Remarks are required to approve');
      return;
    }

    this.apiService.post(`/api/assign/update-status/${this.data.id}/APPROVED`, { remarksByAdmin: this.remarks }).subscribe({
      next: () => {
        this.toastr.success('Task approved successfully');
        this.dialogRef.close(true);
      },
      error: () => this.toastr.error('Failed to approve task')
    });
  }

  /**
   * Rejects the current task.
   * Requires admin remarks to proceed.
   * Sends the rejection request to the backend and handles the response.
   */
  rejectTask() {
    if (!this.remarks.trim()) {
      this.toastr.error('Remarks are required to reject');
      return;
    }

    this.apiService.post(`/api/assign/update-status/${this.data.id}/REJECTED`, { remarksByAdmin: this.remarks }).subscribe({
      next: () => {
        this.toastr.success('Task rejected successfully');
        this.dialogRef.close(true);
      },
      error: () => this.toastr.error('Failed to reject task')
    });
  }

}
