import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Work } from '../../../models/work.model';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-work-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './add-work-dialog.component.html',
  styleUrl: './add-work-dialog.component.css'
})
export class AddWorkDialogComponent {
  /** Form group to manage work input fields */
  workForm: FormGroup;

  /** Flag to track form submission state */
  submitted = false;

  /** Flag to indicate loading state during API request */
  loading = false;

  /**
   * Constructor to initialize dependencies and form group.
   * @param {FormBuilder} formBuilder - Service to create form groups.
   * @param {ApiService} apiService - Service for API interactions.
   * @param {MatDialogRef<AddWorkDialogComponent>} dialogRef - Reference to the dialog instance.
   * @param {ToastrService} toastr - Service for displaying notifications.
   * @param {Work} data - Injected data containing work details (if any).
   */
  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddWorkDialogComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: Work
  ) {
    this.workForm = this.formBuilder.group({
      workName: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  /**
   * Getter for form controls.
   * @returns {any} Form controls object.
   */
  get f() {
    return this.workForm.controls;
  }

  /**
   * Handles form submission to create a new work entry.
   * Sends a POST request to the server with form data.
   */
  onSubmit() {
    if (this.workForm.valid) {
      this.loading = true;

      const token = localStorage.getItem('accessToken');

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      this.apiService.post('/api/work/addWork', this.workForm.value, { headers })
        .subscribe({
          next: () => {  // Removed unused 'response' parameter
            this.loading = false;
            this.toastr.success('Work added successfully');
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error:', error);
            this.loading = false;
            this.toastr.error(error.message || 'Failed to add work');
          }
        });
    } else {
      this.toastr.error('Please fill all required fields correctly');
    }
  }

  /**
   * Handles dialog cancellation and resets the form.
   * @param {MouseEvent} [event] - Click event to detect if cancel is triggered via overlay.
   */
  onCancel(event?: MouseEvent): void {
    if (event?.target === event?.currentTarget || !event) {
      this.submitted = false;
      this.workForm.reset();
      this.dialogRef.close();
    }
  }
}
