/**
 * Interface representing the data required for user login.
 */
export interface LoginModel {
  email: string;
  password: string;
}

/**
 * Interface representing the response received after a successful login.
 */
export interface LoginResponseModel {
  accessToken: string;
  refreshToken: string;
}
