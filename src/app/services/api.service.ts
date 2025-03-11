import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';

/**
 * Service to handle API requests with HTTP methods.
 */
@Injectable({
    providedIn: 'root'
})
export class ApiService {
    /** Base URL for API requests */
    private baseUrl = environment.apiUrl;

    /**
     * Constructor to inject HttpClient.
     * @param {HttpClient} http - The HTTP client service.
     */
    constructor(private http: HttpClient) { }

    /**
    * Sends a GET request to the given endpoint.
    * @param {string} endpoint - API endpoint.
    * @param {any} [options] - Optional HTTP options.
    * @returns {Observable<HttpEvent<T>>} - Observable of HTTP response.
    */
    get<T>(endpoint: string, options?: any): Observable<HttpEvent<T>> {
        return this.http.get<T>(`${this.baseUrl}${endpoint}`, options);
    }

    /**
    * Sends a POST request to the given endpoint with the provided body.
    * @param {string} endpoint - API endpoint.
    * @param {any} body - Data to be sent in the request body.
    * @param {any} [options] - Optional HTTP options.
    * @returns {Observable<HttpEvent<T>>} - Observable of HTTP response.
    */
    post<T>(endpoint: string, body: any, options?: any): Observable<HttpEvent<T>> {
        return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, options);
    }

    /**
     * Sends a PUT request to the given endpoint with the provided body.
     * @param {string} endpoint - API endpoint.
     * @param {any} body - Data to be sent in the request body.
     * @param {any} options - HTTP options including headers.
     * @returns {Observable<T>} - Observable of HTTP response.
     */
    put<T>(endpoint: string, body: any, options: any): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
            headers: options.headers
        })
    }

    /**
   * Sends a DELETE request to the given endpoint.
   * @param {string} endpoint - API endpoint.
   * @param {any} [options] - Optional HTTP options.
   * @returns {Observable<HttpEvent<T>>} - Observable of HTTP response.
   */
    delete<T>(endpoint: string, options?: any): Observable<HttpEvent<T>> {
        return this.http.delete<T>(`${this.baseUrl}${endpoint}`, options);
    }

    /**
     * Sends a PATCH request to the given endpoint with the provided body.
     * @param {string} endpoint - API endpoint.
     * @param {any} body - Data to be sent in the request body.
     * @param {any} [options] - Optional HTTP options.
     * @returns {Observable<HttpEvent<T>>} - Observable of HTTP response.
     */
    patch<T>(endpoint: string, body: any, options?: any): Observable<HttpEvent<T>> {
        return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, options);
    }
}
