export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  fullName: string;
  department?: string;
}

export interface AuthError {
  message: string;
} 