import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Represents a user profile with basic information.
 * @interface Profile
 * @property {number} id - The unique identifier of the profile.
 * @property {string} firstName - The user's first name.
 * @property {string} lastName - The user's last name.
 * @property {number} email - The user's email address (Note: Likely intended as string, adjust if typo).
 */
interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  email: number;
}

/**
 * Component for editing a user's profile in a dialog.
 * Allows updating first name, last name, and email, with form validation and API integration.
 * @class EditUserProfileComponent
 */
@Component({
  selector: 'app-edit-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user-profile.component.html',
  styleUrl: './edit-user-profile.component.css'
})
export class EditUserProfileComponent {

  /**
   * The reactive form group containing profile fields with validation.
   * @type {FormGroup}
   */
  profileForm: FormGroup;

  /**
    * Indicates whether the form has been submitted.
    * Used to trigger validation error display.
    * @type {boolean}
    * @default false
    */
  submitted = false;

  /**
   * Creates an instance of EditUserProfileComponent.
   * Initializes the profile form with required fields and validators.
   * @constructor
   * @param {FormBuilder} formBuilder - Angular service for creating reactive forms.
   * @param {MatDialogRef<EditUserProfileComponent>} dialogRef - Reference to the dialog for closing it.
   * @param {ApiService} apiService - Service for making HTTP requests to the backend API.
   * @param {ToastrService} toastr - Service for displaying toast notifications.
   * @param {Profile} data - The profile data injected via MAT_DIALOG_DATA.
   */
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EditUserProfileComponent>,
    private apiService: ApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: Profile
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /**
   * Initializes the component after Angular has initialized the component's view.
   * Populates the form with existing profile data if provided.
   * @method ngOnInit
   */
  ngOnInit() {
    if (this.data) {
      this.profileForm.patchValue({
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
    return this.profileForm.controls;
  }

  /**
   * Closes the dialog without saving changes.
   * Returns false to indicate cancellation.
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Submits the updated profile data to the API.
   * Validates the form, sends a PUT request, and closes the dialog on success.
   * Displays success or error notifications via Toastr.
   */
  onSubmit() {
    this.submitted = true;

    if (this.profileForm.invalid) {
      return;
    }

    const profileData = {
      ...this.profileForm.value,
      id: this.data.id
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.put(`/user/${this.data.id}`, profileData, { headers }).subscribe({
      next: () => {
        this.toastr.success('Profile updated successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Failed to update theatre');
      }
    });
  }
}
