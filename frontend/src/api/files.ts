import { api } from "./client";

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  modified: string;
  isDir: boolean;
  type?: string;
  extension?: string;
  isShared?: boolean;
}

export interface ShareLink {
  id: string;
  token: string;
  path: string;
  type: string;
  expires_at: string;
  created_at: string;
}

export interface DirectoryListing {
  path: string;
  name: string;
  isDir: boolean;
  items: FileInfo[];
  numDirs: number;
  numFiles: number;
}

export const filesApi = {
  // List directory contents
  list: (
    path: string = "/",
    sort: string = "name",
    order: string = "asc",
  ): Promise<DirectoryListing> => {
    // Handle root path - don't include trailing slash
    let resourcePath = "/resources";
    if (path && path !== "/") {
      const encodedPath = encodeURIComponent(path).replace(/%2F/g, "/");
      resourcePath = `/resources${encodedPath}`;
    }
    return api.get(`${resourcePath}?sort=${sort}&order=${order}`);
  },

  // Get file info
  getInfo: (path: string): Promise<FileInfo> => {
    const encodedPath = encodeURIComponent(path).replace(/%2F/g, "/");
    return api.get(`/resources${encodedPath}`);
  },

  // Create directory
  createDir: (path: string): Promise<{ message: string; path: string }> => {
    // Ensure path ends with /
    const dirPath = path.endsWith("/") ? path : path + "/";
    const encodedPath = encodeURIComponent(dirPath).replace(/%2F/g, "/");
    return api.post(`/resources${encodedPath}`);
  },

  // Upload file - sends file as raw body (like filebrowser approach)
  upload: (path: string, file: File): Promise<FileInfo> => {
    const encodedPath = encodeURIComponent(path).replace(/%2F/g, "/");
    // Send file directly as body - more efficient for large files
    return api.post(`/resources${encodedPath}`, file);
  },

  // Delete file or directory
  delete: (path: string): Promise<void> => {
    const encodedPath = encodeURIComponent(path).replace(/%2F/g, "/");
    return api.delete(`/resources${encodedPath}`);
  },

  // Rename file or directory
  rename: (path: string, newName: string): Promise<FileInfo> => {
    const encodedPath = encodeURIComponent(path).replace(/%2F/g, "/");
    return api.patch(`/resources${encodedPath}`, { newName });
  },

  // Get download URL
  getDownloadUrl: (path: string): string => {
    const encodedPath = encodeURIComponent(path).replace(/%2F/g, "/");
    return `/api/raw${encodedPath}`;
  },

  // Get storage usage stats
  getStorage: (): Promise<{
    used: number;
    total: number;
    free: number;
    folders: Record<string, number>;
  }> => {
    return api.get("/storage");
  },
  // Create share link
  createShare: (
    path: string,
    type: string,
    expires?: string,
    unit?: string,
  ): Promise<ShareLink> => {
    const body: any = { path, type };
    if (expires !== undefined) body.expires = expires;
    if (unit !== undefined) body.unit = unit;
    return api.post("/share", body);
  },

  // Get share link
  getShare: (token: string): Promise<ShareLink> => {
    return api.get(`/share/public?token=${token}`);
  },

  // Delete share link
  deleteShare: (token: string): Promise<void> => {
    return api.delete(`/share?token=${token}`);
  },

  // Get list of shares
  getShares: (): Promise<ShareLink[]> => {
    return api.get("/shares");
  },

  // Get shared folder contents
  getSharedFolder: (token: string, subpath?: string): Promise<{
    token: string;
    path: string;
    name: string;
    type: string;
    expires_at: string;
    expires: string;
    isDir: boolean;
    subpath?: string;
    items: FileInfo[];
    numDirs: number;
    numFiles: number;
  }> => {
    let url = `/share/public?token=${token}`;
    if (subpath) {
      url += `&subpath=${encodeURIComponent(subpath)}`;
    }
    return api.get(url);
  },
};

export default filesApi;
