import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Work } from '../../../models/work.model';

@Component({
  selector: 'app-edit-work-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './edit-work-dialog.component.html',
  styleUrl: './edit-work-dialog.component.css'
})
export class EditWorkDialogComponent implements OnInit {
  /** Form group for editing work details */
  workForm: FormGroup;

  /** Flag to track form submission state */
  submitted = false;

  /**
   * Constructor to initialize the component.
   * @param {FormBuilder} formBuilder - Service to create reactive forms.
   * @param {MatDialogRef<EditWorkDialogComponent>} dialogRef - Reference to the dialog instance.
   * @param {ApiService} apiService - Service to interact with the API.
   * @param {ToastrService} toastr - Service to show toast notifications.
   * @param {Work} data - Injected work data from the dialog.
   */
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EditWorkDialogComponent>,
    private apiService: ApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: Work
  ) {
    this.workForm = this.formBuilder.group({
      workName: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  /**
   * Lifecycle hook that runs on component initialization.
   * Patches form values with the provided work data.
   */
  ngOnInit() {
    if (this.data) {
      this.workForm.patchValue({
        workName: this.data.workName,
        description: this.data.description,
      });
    }
  }

  /**
   * Getter for easy access to form controls.
   * @returns {FormGroup['controls']} Form controls.
   */
  get f() {
    return this.workForm.controls;
  }

  /**
   * Submits the form and sends an API request to update the work details.
   * If the form is invalid, the function returns early.
   */
  onSubmit() {
    this.submitted = true;

    if (this.workForm.invalid) {
      return;
    }

    const usersData = {
      ...this.workForm.value,
      id: this.data.id
    };
    console.log('Payload to API:', usersData);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.put(`/api/work/updateWork/${this.data.id}`, usersData, { headers }).subscribe({
      next: () => {
        this.toastr.success('Work updated successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Failed to update work');
      }
    });
  }

  /**
   * Closes the dialog and resets the form if triggered by an event.
   * @param {MouseEvent} [event] - Optional event object from user interaction.
   */
  onCancel(event?: MouseEvent): void {
    if (event?.target === event?.currentTarget || !event) {
      this.submitted = false;
      this.workForm.reset();
      this.dialogRef.close();
    }
  }
}
