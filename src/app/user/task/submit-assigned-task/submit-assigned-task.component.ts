import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api.service';

/**
 * Component for submitting an assigned task with a file and remarks.
 * 
 * Features:
 * - Allows users to select a file and provide remarks.
 * - Submits the task to the backend via a multipart/form-data request.
 * - Shows success or error notifications using Toastr.
 * - Passes the task assignment ID via Angular Material dialog data.
 * 
 * @component
 */
@Component({
  selector: 'app-submit-assigned-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './submit-assigned-task.component.html',
  styleUrl: './submit-assigned-task.component.css'
})
export class SubmitAssignedTaskComponent {
  remarks: string = '';
  selectedFile: File | null = null;

  constructor(
    public dialogRef: MatDialogRef<SubmitAssignedTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { assignmentId: number },
    private http: HttpClient,
    private toastr: ToastrService,
    private apiService: ApiService
  ) { }

  /**
   * Handles the file input change event.
   * Stores the selected file in the component state.
   * 
   * @param {any} event - The file input change event.
   */
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  /**
 * Submits the assigned task to the backend.
 * Requires both a file and remarks to proceed.
 * Sends a multipart/form-data POST request with authentication headers.
 * Displays success or error notifications based on the response.
 */
  submitAssignedTask() {
    if (!this.selectedFile || !this.remarks) {
      this.toastr.error('Please provide both file and remarks.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('remarks', this.remarks);

    const headers = {
      // Let browser set Content-Type for multipart/form-data automatically, don't set here manually
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.post(`/api/assign/markAsDone/${this.data.assignmentId}`, formData, { headers }).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.toastr.success('Task submitted successfully.');
          this.dialogRef.close(true);
        } else if (response && !response.success) {
          this.toastr.error(response.message || 'Failed to submit task');
        } else {
          this.toastr.error('Unexpected response from server');
        }
      },
      error: (error) => {
        console.error('Submission Error:', error);
        const errorMessage = error?.error?.message || 'An unexpected error occurred.';
        this.toastr.error(errorMessage);
      }
    });
  }

}
