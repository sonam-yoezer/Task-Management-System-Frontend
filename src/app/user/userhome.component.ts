import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { HttpEventType, HttpResponse } from '@angular/common/http';


/**
 * UserhomeComponent
 *
 * This component displays the dashboard summary for a logged-in user.
 * It retrieves task summary data specific to the authenticated user,
 * including total tasks, completed tasks, in-progress tasks, overdue tasks,
 * upcoming tasks, and recent activities.
 */
@Component({
  selector: 'app-userhome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './userhome.component.html',
  styleUrl: './userhome.component.css'
})
export class UserhomeComponent {
  totalTasks: number = 0;
  completedTasks: number = 0;
  inProgressTasks: number = 0;
  overdueTasks: number = 0;

  upcomingTasks: any[] = [];
  recentActivities: any[] = [];
  loading = false;
  currentUser$: any;

  /**
   * Constructor for UserhomeComponent
   * @param authService - Service to manage user authentication and sessions
   * @param toastr - Service for displaying toast notifications
   * @param apiService - Service for making HTTP API requests
   * @param router - Angular Router for navigation
   */
  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.getCurrentUser();
  }

  /**
 * Angular lifecycle hook that runs after component initialization.
 * Automatically loads the user's dashboard summary data.
 */
  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
  * Loads the user's dashboard summary from the backend API.
  * Populates task statistics and recent activity lists.
  * Displays an error toast if data retrieval fails.
  */
  private loadDashboardData(): void {
    this.loading = true;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.get<any>('/api/assign/user/summary', { headers, observe: 'response' }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<any>;
          if (response.body) {
            this.totalTasks = response.body.totalTasks;
            this.completedTasks = response.body.completedTasks;
            this.inProgressTasks = response.body.inProgressTasks;
            this.overdueTasks = response.body.overdueTasks;
            this.upcomingTasks = response.body.upcomingTasks;
            this.recentActivities = response.body.recentActivities;
          }
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Failed to load dashboard data', error);
        this.toastr.error('Failed to load dashboard data');
        this.loading = false;
      }
    });
  }

}
