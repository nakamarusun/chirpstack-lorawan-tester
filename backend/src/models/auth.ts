export interface CustomJwtPayload {
  id: string;
}

export interface LoginRequest {
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
}