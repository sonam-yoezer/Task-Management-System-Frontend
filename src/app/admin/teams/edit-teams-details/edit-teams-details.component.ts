import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Represents a user entity with basic profile information.
 * @interface User
 * @property {number} id - The unique identifier of the user.
 * @property {string} firstName - The user's first name.
 * @property {string} lastName - The user's last name.
 * @property {string} email - The user's email address.
 */
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Component for editing team member details in a dialog.
 * Allows updating first name, last name, and email, with form validation and API integration.
 * @class EditTeamsDetailsComponent
 * @implements {OnInit} - Angular lifecycle hook for initialization.
 */
@Component({
  selector: 'app-edit-teams-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './edit-teams-details.component.html',
  styleUrl: './edit-teams-details.component.css'
})
export class EditTeamsDetailsComponent implements OnInit {

  /**
   * The reactive form group containing user fields with validation.
   * @type {FormGroup}
   */
  usersForm: FormGroup;

  /**
   * Indicates whether the form has been submitted.
   * Used to trigger validation error display.
   * @type {boolean}
   * @default false
   */
  submitted = false;

  /**
   * Creates an instance of EditTeamsDetailsComponent.
   * Initializes the user form with required fields and validators.
   * @constructor
   * @param {FormBuilder} formBuilder - Angular service for creating reactive forms.
   * @param {MatDialogRef<EditTeamsDetailsComponent>} dialogRef - Reference to the dialog for closing it.
   * @param {ApiService} apiService - Service for making HTTP requests to the backend API.
   * @param {ToastrService} toastr - Service for displaying toast notifications.
   * @param {User} data - The user data injected via MAT_DIALOG_DATA.
   */
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EditTeamsDetailsComponent>,
    private apiService: ApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {
    this.usersForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
    });
  }

  /**
   * Initializes the component after Angular has initialized the component's view.
   * Populates the form with existing user data if provided.
   * @method ngOnInit
   */
  ngOnInit() {
    if (this.data) {
      this.usersForm.patchValue({
        firstName: this.data.firstName,
        lastName: this.data.lastName,
        email: this.data.email,
      });
    }
  }

  /**
   * Provides access to the form controls for validation and error checking.
   * @returns {{ [key: string]: any }} An object containing the form controls.
   */
  get f() {
    return this.usersForm.controls;
  }

  /**
   * Submits the updated user data to the API.
   * Validates the form, sends a PUT request, and closes the dialog on success.
   * Displays success or error notifications via Toastr.
   */
  onSubmit() {
    this.submitted = true;

    if (this.usersForm.invalid) {
      return;
    }

    const usersData = {
      ...this.usersForm.value,
      id: this.data.id
    };
    console.log('Payload to API:', usersData);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.put(`/user/${this.data.id}`, usersData, { headers }).subscribe({
      next: () => {
        this.toastr.success('customer updated successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Failed to update theatre');
      }
    });
  }

  /**
   * Closes the dialog without saving changes and resets the form.
   * Closes only if triggered by an overlay click or explicitly called without an event.
   * @param {MouseEvent} [event] - Optional mouse event from clicking the overlay or cancel button.
   */
  onCancel(event?: MouseEvent): void {
    if (event?.target === event?.currentTarget || !event) {
      this.submitted = false;
      this.usersForm.reset();
      this.dialogRef.close();
    }
  }

}
