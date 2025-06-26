import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { SignupModel } from '../../models/signup.model';
import { SignupService } from '../../services/signup.service';

/**
 * SignupComponent
 * 
 * This component handles user signup by providing a form with validation.
 * It interacts with the SignupService to send signup requests and uses Toastr for notifications.
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, RouterLink, ToastrModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  /** The reactive form group for login inputs */
  signupForm: FormGroup;
  /** Indicates whether the form has been submitted */
  submitted = false;

  /**
   * Constructor to inject dependencies
   * @param {FormBuilder} formBuilder - Form builder for reactive forms
   * @param {SignupService} signupService - Service to handle signup requests
   * @param {Router} router - Angular router for navigation
   * @param {ToastrService} toastr - Toastr service for notifications
   */
  constructor(
    private formBuilder: FormBuilder,
    private signupService: SignupService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.signupForm = this.formBuilder.group({
      firstName: ['', [
        Validators.required,
      ]],
      lastName: ['', [
        Validators.required,
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Custom validator to check if password and confirm password fields match.
   * @param {FormGroup} form - The form group containing the password fields
   * @returns {null | { passwordMismatch: boolean }} - Returns validation error object if passwords do not match, otherwise null
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    return password && confirmPassword && password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  /**
   * Handles form submission.
   * If the form is valid, it sends the signup request to the server.
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.signupForm.invalid) {
      return;
    }

    const signupData: SignupModel = {
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      firstName: this.signupForm.value.firstName,
      lastName: this.signupForm.value.lastName,
    };

    this.signupService.signup(signupData).subscribe({
      next: (data) => {
        this.toastr.success('Signup successful', 'Success');
        this.router.navigate(['login']);
      },
      error: (data) => {
        this.toastr.error(data.error?.message || 'Signup failed', 'Error');
      }
    });
  }

   /**
   * Getter for easy access to form controls
   * @returns {any} - Form controls object
   */
  get f() { return this.signupForm.controls; }
}
