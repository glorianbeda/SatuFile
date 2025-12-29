export interface User {
  id: number;
  username: string;
  password?: string;
  scope: string;
  locale: string;
  viewMode: 'list' | 'grid';
  perm: Permissions;
}

export interface Permissions {
  admin: boolean;
  execute: boolean;
  create: boolean;
  rename: boolean;
  modify: boolean;
  delete: boolean;
  share: boolean;
  download: boolean;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDir: boolean;
  modified: string;
  mode: number;
  type: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
}
