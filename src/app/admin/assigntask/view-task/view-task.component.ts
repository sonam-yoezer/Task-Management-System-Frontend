import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { AddTaskDialogComponent } from '../add-task-dialog/add-task-dialog.component';
import { FormsModule } from '@angular/forms';
import { Task } from 'zone.js/lib/zone-impl';
import { ViewTaskByIdComponent } from '../view-task-by-id/view-task-by-id.component';

/**
 * Interface representing the structure of a task assignment.
 */
export interface Tasks {
  assignment_id: string;
  dateline: string;
  email: string;
  firstName: string;
  lastName: string;
  user_role: string;
  workName: string;
  description: string;
  status: string;
}

/**
 * Component to display, search, and manage assigned tasks.
 */
@Component({
  selector: 'app-view-task',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.css']
})
export class ViewTaskComponent implements OnInit {
  assignedTasks: Tasks[] = [];
  task: Tasks[] = [];
  filteredAssignedTasks: Tasks[] = [];
  loading = false;
  error: string | null = null;
  searchTermSubject = new Subject<string>();
  searchTerm: string = '';
  selectedStatus: string = 'all';

  /**
   * Creates an instance of ViewTaskComponent.
   * 
   * @param apiService - Custom API service for HTTP operations.
   * @param toastr - Toastr service for displaying notifications.
   * @param dialog - Angular Material dialog service.
   */
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }

  /**
   * Initializes the component by setting up search listeners and fetching tasks.
   */
  ngOnInit() {
    this.searchTermSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filterTasks(term);
    });

    this.fetchTasks();
  }

  /**
 * Filters tasks by work name based on the current search term.
 * 
 * @returns A filtered list of tasks.
 */
  filterTask(): Tasks[] {
    if (!this.searchTerm) {
      return [...this.task];
    }

    return this.task.filter(task =>
      task.workName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  /**
   * Filters assigned tasks based on the provided search term.
   * 
   * @param term - The search input from the user.
   */
  filterTasks(term: string) {
    if (!term) {
      this.filteredAssignedTasks = [...this.assignedTasks];
    } else {
      const lowerTerm = term.toLowerCase();
      this.filteredAssignedTasks = this.assignedTasks.filter(task =>
        (task.firstName + ' ' + task.lastName).toLowerCase().includes(lowerTerm) ||
        task.email.toLowerCase().includes(lowerTerm) ||
        task.workName.toLowerCase().includes(lowerTerm) ||
        task.description.toLowerCase().includes(lowerTerm)
      );
    }
  }

  /**
   * Fetches all assigned tasks from the backend API.
   * Handles loading state, success, and error messages.
   */
  fetchTasks(): void {
    this.loading = true;
    this.error = null;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.get<Tasks[]>('/api/assign/allTasks', { headers, observe: 'response' }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<Tasks[]>;
          if (response.body) {
            this.assignedTasks = response.body;
            this.filteredAssignedTasks = [...this.assignedTasks];
          }
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = error.message || 'Failed to fetch tasks';
        this.loading = false;
        this.toastr.error();
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Opens the Add Task dialog.
   * After the dialog is closed, refreshes the task list if a task was added.
   */
  openAddWorkDialog() {
    const dialogRef = this.dialog.open(AddTaskDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the theatres list after adding
        this.fetchTasks();
        this.toastr.success('Task added successfully');
      }
    });
  }

  /**
 * Opens a dialog to view the details of a specific task by its ID.
 * 
 * Process:
 * - Opens the `ViewTaskByIdComponent` in a modal dialog.
 * - Passes the selected task ID as dialog data for detailed viewing.
 * - After the dialog is closed, optionally refreshes the task list if changes were made.
 * 
 * @param {string} taskId - The ID of the task to be viewed.
 */
  viewTask(taskId: string) {
    const dialogRef = this.dialog.open(ViewTaskByIdComponent, {
      width: '600px',
      disableClose: true,
      data: { id: taskId } // Pass the assignment ID to the dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Optionally refresh the task list if changes were made
        this.fetchTasks();
      }
    });
  }

  fetchTasksByStatus(status: string): void {
    this.loading = true;
    this.error = null;
    this.selectedStatus = status;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    if (status === 'all') {
      this.fetchTasks();
      return;
    }

    this.apiService.get<Tasks[]>(`/api/assign/getTaskByStatus/${status}`, { headers, observe: 'events' })
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.Response) {
            const tasks = event.body;
            if (tasks && tasks.length > 0) {
              this.assignedTasks = tasks;
              this.filteredAssignedTasks = [...this.assignedTasks];
              this.error = null;
            } else {
              this.assignedTasks = [];
              this.filteredAssignedTasks = [];
              this.error = 'No data available for this status';
            }
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          if (error.status === 404 && error.error?.message?.includes('No tasks found')) {
            this.assignedTasks = [];
            this.filteredAssignedTasks = [];
            this.error = 'No data available for this status';
          } else {
            this.error = error.message || `Failed to fetch tasks with status: ${status}`;
            this.toastr.error(this.error ?? 'Unknown error');
          }
        }
      });
  }

}
