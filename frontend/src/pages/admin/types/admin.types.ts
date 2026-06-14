import type { User } from '../../../api/auth';

// Расширяем базовый тип User
export interface UserWithStorage extends User {
  storage_used_display?: string;
  storage_limit_display?: string;
  storage_percent?: number;
}

export interface StorageInfo {
  storage_limit: number;
  storage_used: number;
  storage_limit_display: string;
  storage_used_display: string;
  storage_free: number;
  storage_free_display: string;
  storage_percent: number;
}