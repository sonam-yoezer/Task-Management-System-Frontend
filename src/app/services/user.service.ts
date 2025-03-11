import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  /**
  * Observable for tracking the current user.
  */
  currentUser$ = this.currentUserSubject.asObservable();

  /**
   * Sets the current user.
   * @param {User} user - The user object to set as the current user.
   */
  setCurrentUser(user: User) {
    this.currentUserSubject.next(user);
  }

  /**
  * Clears the current user.
  */
  clearCurrentUser() {
    this.currentUserSubject.next(null);
  }

  /**
   * Retrieves the current user.
   * @returns {User | null} The current user or null if none is set.
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }
}
