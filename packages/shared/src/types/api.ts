import type { ErrorCode } from "../constants/enums.js";

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: Meta;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  code: ErrorCode;
  errors?: FieldError[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface HealthData {
  status: "ok";
  version: string;
  uptimeSeconds: number;
}
