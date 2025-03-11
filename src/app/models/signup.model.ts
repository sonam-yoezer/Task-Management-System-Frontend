/**
 * Interface representing the data required for user signup.
 */
export interface SignupModel {
    firstName: string;
    lastName: string;
    email: String;
    password: string;
    confirmPassword?: string;
    isActive?: String;
}
