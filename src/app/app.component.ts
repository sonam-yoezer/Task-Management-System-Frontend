import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'TaskManagement';

  /**
   * Constructor for AppComponent.
   * Injects the router and authService to handle route events and authentication logic.
   *
   * @param {Router} router - The router service for navigation.
   * @param {AuthService} authService - The authentication service for managing user sessions and roles.
   */
  constructor(private router: Router, private authService: AuthService) { }

  /**
   * Lifecycle hook for component initialization.
   * Subscribes to the router events and applies custom logic for route redirection.
   *
   * - If the user is not logged in and tries to access restricted routes, they are redirected to the login page.
   * - If the user is logged in and their role doesn't match the target route (admin/user), they are redirected to the landing page.
   *
   * @returns {void}
   */
  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const userRole = this.authService.getRoles(); // Get stored user role
        const isLoggedIn = this.authService.getToken(); // Check if user is logged in

        if (!isLoggedIn && event.url !== '/' && event.url !== '/signup' && event.url !== '/login') {
          this.router.navigate(['/']);
        }

        if (isLoggedIn && userRole) {
          if (
            (userRole === 'admin' && event.url.startsWith('/user')) ||
            (userRole === 'user' && event.url.startsWith('/admin'))
          ) {
            this.router.navigate(['/']);
          }
        }
      }
    });
  }
}
