import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { LoginModel } from '../../models/login.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterModule, ToastrModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  /** The reactive form group for login inputs */
  loginForm: FormGroup;
  /** Tracks whether the form has been submitted */
  submitted = false;
  /** Stores any error message to display */
  errorMessage = '';

  /**
   * Creates an instance of LoginComponent.
   * @param {FormBuilder} formBuilder - Service to build reactive forms
   * @param {AuthService} authService - Service for authentication operations
   * @param {Router} router - Service for navigation
   * @param {ToastrService} toastr - Service for showing toast notifications
   */
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  /**
   * Lifecycle hook that runs after component initialization.
   * Checks for existing authentication and redirects accordingly.
   */
  ngOnInit(): void {
    const token = this.authService.getToken();
    const roles = this.authService.getRoles();

    if (token && roles) {
      this.redirectByRole(roles);
    } else if (token) {
      // Fetch user again if role is missing
      this.authService.getCurrentUser().subscribe(user => {
        this.authService.setRoles(user?.role);
        this.redirectByRole(user?.role);
      });
    }
  }

  /**
   * Handles form submission for user login.
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    const loginData: LoginModel = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.authService.setToken(response.accessToken);
        if (response.refreshToken) {
          this.authService.setRefreshToken(response.refreshToken);
        }

        const roles = this.authService.getRoles();
        if (this.authService.getRoles() == null || this.authService.getRoles() == undefined) {
          this.authService.getCurrentUser().subscribe(user => {
            this.authService.setRoles(user?.role);
            this.redirectByRole(this.authService.getRoles());
          });
        } else {
          this.redirectByRole(this.authService.getRoles());
        }

      },
      error: (data) => {
        this.toastr.error(data.error?.message || 'Login failed', 'Error');
      },
    });

  }

  /**
   * Redirects user based on their role after successful login.
   * @param {string | null} roles - The user's role(s)
   */
  redirectByRole(roles: string | null): void {
    if (roles == 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (roles == 'user') {
      this.router.navigate(['/user/dashboard']);
    }
    this.toastr.success('Login successful', 'Success');
  }

  /**
   * Getter for accessing form controls.
   * @returns {any} The form controls object
   */
  get f() {
    return this.loginForm.controls;
  }
}
