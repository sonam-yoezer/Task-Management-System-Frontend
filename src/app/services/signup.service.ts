import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SignupModel } from '../models/signup.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
   /**
   * Creates an instance of SignupService.
   * @param {ApiService} apiService - Service for making API requests.
   */
  constructor(private apiService: ApiService) { }

  /**
   * Sends a signup request to the server.
   * @param {SignupModel} signupData - The data required for user signup.
   * @returns {Observable<any>} An observable of the server response.
   */
  signup(signupData: SignupModel): Observable<any> {
    return this.apiService.post('/auth/signup', signupData);
  }
}
