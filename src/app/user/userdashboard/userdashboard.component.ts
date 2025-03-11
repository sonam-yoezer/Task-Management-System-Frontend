import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-userdashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './userdashboard.component.html',
  styleUrl: './userdashboard.component.css'
})
export class UserdashboardComponent {
  loading = false;
  currentUser$: Observable<User | null>;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { this.currentUser$ = this.authService.getCurrentUser(); }

  async logout() {
    try {
      this.loading = true;
      await this.authService.logout();

      this.router.navigate(['/login']);

    } catch (error) {
      alert('Failed to logout. Please try again.');
    } finally {
      this.loading = false;
    }
  }

}
