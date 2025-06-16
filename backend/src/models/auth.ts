export interface CustomJwtPayload {
  id: number;
}

export interface LoginRequest {
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
}