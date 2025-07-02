import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';


/**
 * HomeComponent
 *
 * This component is responsible for displaying the user/admin dashboard summary.
 * It retrieves task summary statistics such as total tasks, completed tasks,
 * in-progress tasks, overdue tasks, upcoming tasks, and recent activities.
 *
 * It also provides task filtering based on status.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  totalTasks: number = 0;
  completedTasks: number = 0;
  inProgressTasks: number = 0;
  overdueTasks: number = 0;

  upcomingTasks: any[] = [];
  recentActivities: any[] = [];
  loading = false;
  currentUser$: any;

  filteredAssignedTasks: any[] = [];
  allTasks: any[] = [];
  selectedStatus: string = 'all';
  error = '';


  /**
 * Constructor for HomeComponent
 * @param authService - Service for authentication and user session management
 * @param toastr - Service for displaying toast notifications
 * @param apiService - Service for making API requests
 * @param router - Angular router for navigation
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
   * Angular lifecycle hook that initializes the component.
   * Loads the dashboard summary data on component load.
   */
  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
 * Loads the dashboard summary data from the API.
 * Populates the total tasks, completed tasks, in-progress tasks, overdue tasks,
 * upcoming tasks, and recent activities.
 *
 * Shows a loading spinner while fetching data.
 * Displays an error toast if the request fails.
 */
  private loadDashboardData(): void {
    this.loading = true;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.get<any>('/api/assign/admin/summary', { headers, observe: 'response' }).subscribe({

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

  /**
 * Filters the tasks based on the selected status.
 * Supported statuses: all, completed, approved, in-progress, incomplete.
 *
 * @param status - The selected task status to filter by
 */
  fetchTasksByStatus(status: string) {
    this.loading = true;

    if (status === 'all') {
      // Fetch all tasks
      this.filteredAssignedTasks = this.allTasks;
    } else if (status === 'completed') {
      // Fetch tasks where status is 'completed' or 'approved'
      this.filteredAssignedTasks = this.allTasks.filter(task => task.status === 'completed' || task.status === 'approved');
    } else if (status === 'in-progress') {
      this.filteredAssignedTasks = this.allTasks.filter(task => task.status === 'in-progress');
    } else if (status === 'incomplete') {
      this.filteredAssignedTasks = this.allTasks.filter(task => task.status === 'incomplete');
    } else {
      // Generic filter for other statuses
      this.filteredAssignedTasks = this.allTasks.filter(task => task.status === status);
    }

    this.loading = false;
  }

}
