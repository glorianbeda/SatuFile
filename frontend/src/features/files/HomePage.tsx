import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, alpha } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { Header, StoragePanel } from "@/components/layout";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/contexts/ToastProvider";
import {
  FileList,
  CategoryFilter,
  UploadModal,
  UploadProgress,
} from "@/components/files";
import type { UploadItem } from "@/components/files";
import SharesView from "@/components/files/SharesPanel";
import {
  FolderToolbar,
  type ViewMode,
  type SortOption,
  type SortOrder,
} from "@/components/files/FolderToolbar";
import { FileGrid, type FileItem } from "@/components/files/FileGrid";
import { Breadcrumb } from "@/components/files/Breadcrumb";
import { NewFolderDialog } from "@/components/files/NewFolderDialog";
import {
  FileContextMenu,
  type FileContextMenuItem,
} from "@/components/files/FileContextMenu";
import { BackgroundContextMenu } from "@/components/files/BackgroundContextMenu";
import { FilePreviewModal } from "@/components/files/FilePreviewModal";
import { RenameDialog } from "@/components/files/RenameDialog";
import { ShareDialog } from "@/components/files/ShareDialog";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { filesApi, type DirectoryListing } from "@/api";
import type { FileData } from "@/components/files";
import { useWebSocket } from "@/hooks/useWebSocket";

export const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  // Context menu state
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuFile, setMenuFile] = useState<FileItem | null>(null);

  // Background context menu state
  const [bgMenuAnchor, setBgMenuAnchor] = useState<{ top: number; left: number } | null>(null);

  // Preview modal state
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Rename dialog state
  const [renameFile, setRenameFile] = useState<FileItem | null>(null);

  // Share dialog state
  const [shareOpen, setShareOpen] = useState(false);
  const [shareFileName, setShareFileName] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareFile, setShareFile] = useState<FileContextMenuItem | null>(null);

  // Delete confirm dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteFileName, setDeleteFileName] = useState("");
  const [deleteFile, setDeleteFile] = useState<FileContextMenuItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // View and sort state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Upload progress state
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isFolderUpload, setIsFolderUpload] = useState(false);
  const [uploadControllers, setUploadControllers] = useState<Map<string, XMLHttpRequest>>(new Map());
  const uploadSessions = useRef<Map<string, { sessionId: string; currentChunk: number; totalChunks: number; abortController: AbortController; startTime: number }>>(new Map());

  // Shares panel state
  const [sharesOpen, setSharesOpen] = useState(false);

  // Derive current path from URL
  const currentPath = useMemo(() => {
    const path = location.pathname;
    if (path === "/" || path === "/files") return "/";
    if (path.startsWith("/files/")) {
      return "/" + path.slice(7); // Remove '/files/' prefix
    }
    return "/";
  }, [location.pathname]);

  // API state
  const [listing, setListing] = useState<DirectoryListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Navigate to a path (updates URL)
  const navigateToPath = useCallback(
    (path: string) => {
      if (path === "/") {
        navigate("/");
      } else {
        navigate("/files" + path);
      }
    },
    [navigate],
  );

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await filesApi.list(currentPath, sortBy, sortOrder);
      setListing(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [currentPath, sortBy, sortOrder]);

  // WebSocket for real-time updates
  const { lastMessage } = useWebSocket('/api/ws');

  useEffect(() => {
    if (lastMessage?.type === 'FS_EVENT') {
      const { path, op } = lastMessage.payload;
      console.log('Real-time FS event:', op, path);
      
      // Refresh if the event is related to current directory
      // Simplification: refresh on any FS event for now to ensure consistency
      fetchFiles();
    }
  }, [lastMessage, fetchFiles]);

  // Fetch files from API
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Convert API FileInfo to FileData for components
  const files: FileData[] =
    listing?.items?.map((item) => ({
      id: item.path,
      name: item.name,
      type: item.isDir ? ("folder" as const) : ("file" as const),
      extension: item.extension || "",
      size: formatSize(item.size),
      modifiedAt: new Date(item.modified).toLocaleDateString(),
      owner: "Me",
      isShared: item.isShared || false,
    })) || [];

  // Convert for FileGrid
  const gridFiles: FileItem[] =
    listing?.items?.map((item) => ({
      path: item.path,
      name: item.name,
      size: item.size,
      modified: item.modified,
      isDir: item.isDir,
      type: item.type,
      extension: item.extension,
      isShared: item.isShared || false,
    })) || [];

  // Category type detection helper
  const getCategoryType = (ext: string, type?: string): string | undefined => {
    // Strip leading dot if present (.png -> png)
    let extLower = ext?.toLowerCase() || "";
    if (extLower.startsWith(".")) extLower = extLower.slice(1);

    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(
        extLower,
      )
    )
      return "image";
    if (["mp4", "webm", "avi", "mov", "mkv", "wmv", "flv"].includes(extLower))
      return "video";
    if (["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(extLower))
      return "audio";
    if (
      [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "txt",
        "rtf",
        "odt",
      ].includes(extLower)
    )
      return "documents";
    if (type === "image" || type === "video" || type === "audio") return type;
    return undefined;
  };

  // Extract extension from filename
  const getExtFromName = (name: string): string => {
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1] : "";
  };

  // Check if file is previewable (images, videos, audio, pdf)
  const isPreviewable = (name: string): boolean => {
    const ext = getExtFromName(name).toLowerCase();
    return (
      ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext) ||
      ["mp4", "webm", "avi", "mov", "mkv"].includes(ext) ||
      ["mp3", "wav", "ogg", "m4a", "flac"].includes(ext) ||
      ext === "pdf"
    );
  };

  // Filtered files based on activeCategory
  const filteredFiles = useMemo(() => {
    let result = files;
    if (user?.hideDotfiles) {
      result = result.filter((f) => !f.name.startsWith("."));
    }
    if (!activeCategory) return result;
    return result.filter((f) => {
      if (f.type === "folder") return true; // Always show folders
      const ext = f.extension || getExtFromName(f.name);
      return getCategoryType(ext) === activeCategory;
    });
  }, [files, activeCategory, user?.hideDotfiles]);

  const filteredGridFiles = useMemo(() => {
    let result = gridFiles;
    if (user?.hideDotfiles) {
      result = result.filter((f) => !f.name.startsWith("."));
    }
    if (!activeCategory) return result;
    return result.filter((f) => {
      if (f.isDir) return true; // Always show folders
      const ext = f.extension || getExtFromName(f.name);
      return getCategoryType(ext, f.type) === activeCategory;
    });
  }, [gridFiles, activeCategory, user?.hideDotfiles]);

  // Calculate file counts per category
  const fileCounts = useMemo(() => {
    const counts = { documents: 0, image: 0, video: 0, audio: 0, total: 0 };
    gridFiles.forEach((f) => {
      if (f.isDir) return;
      if (user?.hideDotfiles && f.name.startsWith(".")) return;
      counts.total++;
      const ext = f.extension || getExtFromName(f.name);
      const cat = getCategoryType(ext, f.type);
      if (cat && cat in counts) counts[cat as keyof typeof counts]++;
    });
    return counts;
  }, [gridFiles, user?.hideDotfiles]);

  const handleSelect = (id: string, toggle: boolean = true) => {
    setSelectedFiles((prev) => {
      let next;
      if (toggle) {
        next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      } else {
        next = prev.length === 1 && prev[0] === id ? [] : [id];
      }
      
      // Manage multi-select mode flag
      if (next.length === 0) {
        setIsMultiSelectMode(false);
      } else if (next.length > 1) {
        setIsMultiSelectMode(true);
      }
      
      return next;
    });
  };

  const handleSelectAll = useCallback(() => {
    if (selectedFiles.length === files.length && files.length > 0) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((f) => f.id));
    }
  }, [files, selectedFiles]);

  const handleUnselectAll = () => {
    setSelectedFiles([]);
    setIsMultiSelectMode(false);
  };

  // Global keydown listener for CTRL+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        handleSelectAll();
      }
      
      if (e.key === "Escape") {
        handleUnselectAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSelectAll]);

  const handleFileClick = (file: FileData, e: React.MouseEvent) => {
    // If CTRL/Meta is held, or if we are in multi-select mode, toggle
    if (e.ctrlKey || e.metaKey || isMultiSelectMode) {
      handleSelect(file.id, true);
    } else {
      // Normal single click selects ONLY this one (replaces current selection)
      handleSelect(file.id, false);
    }
  };

  const handleFileDoubleClick = (file: FileData) => {
    if (file.type === "folder") {
      navigateToPath(file.id);
    } else if (isPreviewable(file.name)) {
      setPreviewFile(fileDataToContextItem(file) as FileItem);
    } else {
      toast.info("Tidak ada preview untuk file ini");
    }
  };

  const handleGridFileClick = (file: FileItem, e: React.MouseEvent) => {
    // If CTRL/Meta is held, or if we are in multi-select mode, toggle
    if (e.ctrlKey || e.metaKey || isMultiSelectMode) {
      handleSelect(file.path, true);
    } else {
      // Normal single click selects ONLY this one (replaces current selection)
      handleSelect(file.path, false);
    }
  };

  const handleGridFileDoubleClick = (file: FileItem) => {
    if (file.isDir) {
      navigateToPath(file.path);
    } else if (isPreviewable(file.name)) {
      setPreviewFile(file);
    } else {
      toast.info("Tidak ada preview untuk file ini");
    }
  };

  const handleSortChange = (by: SortOption, order: SortOrder) => {
    setSortBy(by);
    setSortOrder(order);
  };

  // Navigation handlers
  const handleBack = () => {
    if (currentPath === "/") return;
    const segments = currentPath.split("/").filter((s) => s);
    segments.pop();
    navigateToPath(segments.length === 0 ? "/" : "/" + segments.join("/"));
  };

  const handleBreadcrumbNavigate = (path: string) => {
    navigateToPath(path);
  };

  const isAtRoot = currentPath === "/";

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await filesApi.list(currentPath, sortBy, sortOrder);
      setListing(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleBgContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBgMenuAnchor({ top: e.clientY, left: e.clientX });
  }, []);

  const handleBgMenuClose = useCallback(() => {
    setBgMenuAnchor(null);
  }, []);

  const handleUpload = async (uploadFiles: File[]) => {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
    const RESUMABLE_THRESHOLD = 10 * 1024 * 1024; // 10MB - files larger than this use resumable upload

    // Create upload items
    const newUploads: UploadItem[] = uploadFiles.map((file, idx) => ({
      id: `upload-${Date.now()}-${idx}`,
      file,
      progress: 0,
      status: "pending" as const,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    // Upload each file
    for (const upload of newUploads) {
      const path =
        currentPath === "/"
          ? `/${upload.file.name}`
          : `${currentPath}/${upload.file.name}`;

      // Update status to uploading
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id ? { ...u, status: "uploading" as const } : u,
        ),
      );

      try {
        // Use resumable upload for large files
        if (upload.file.size > RESUMABLE_THRESHOLD) {
          const completed = await uploadResumable(upload.id, upload.file, path, CHUNK_SIZE);
          if (!completed) {
            // Upload was paused/aborted, do not mark as completed
            continue;
          }

          // Mark as completed only if fully uploaded
          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? { ...u, status: "completed" as const, progress: 100 }
                : u,
            ),
          );
        } else {
          // Use regular upload for small files
          await uploadWithProgress(path, upload.file, (data) => {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === upload.id
                  ? {
                    ...u,
                    progress: data.progress,
                    loaded: data.loaded,
                    speed: data.speed,
                    eta: data.eta,
                  }
                  : u,
              ),
            );
          });

          // Mark as completed
          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? { ...u, status: "completed" as const, progress: 100 }
                : u,
            ),
          );
        }
      } catch (err: any) {
        // Mark as error
        setUploads((prev) =>
          prev.map((u) =>
            u.id === upload.id
              ? { ...u, status: "error" as const, error: err.message }
              : u,
          ),
        );
      }
    }

    // Refresh file list
    const data = await filesApi.list(currentPath, sortBy, sortOrder);
    setListing(data);
  };

  // Upload file with real progress tracking using XMLHttpRequest (like filebrowser)
  const uploadWithProgress = (
    path: string,
    file: File,
    onProgress: (data: {
      progress: number;
      loaded: number;
      speed: number;
      eta: number;
    }) => void,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Encode path properly (keep / but encode special chars)
      // Ensure path starts with /
      const safePath = path.startsWith("/") ? path : `/${path}`;
      const encodedPath = encodeURIComponent(safePath).replace(/%2F/g, "/");
      const token = localStorage.getItem("auth-token");

      // Use absolute URL to avoid any ambiguity
      // Note: We use window.location.origin to ensure we hit the same host (Vite Dev Server)
      // which then proxies to backend.
      const uploadUrl = `${window.location.origin}/api/resources${encodedPath}`;

      console.log("Starting upload:", {
        url: uploadUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const xhr = new XMLHttpRequest();
      const startTime = Date.now();
      let lastLoaded = 0;
      let lastTime = startTime;


      // Store XHR for pause/resume control
      setUploadControllers(prev => {
        const newMap = new Map(prev);
        newMap.set(path, xhr);
        return newMap;
      });

      // Real progress tracking from XHR upload events
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const now = Date.now();
          const progress = Math.round((e.loaded / e.total) * 100);

          // Calculate speed (bytes per second)
          const timeDiff = (now - lastTime) / 1000;
          const bytesDiff = e.loaded - lastLoaded;
          const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;

          // Calculate ETA
          const remaining = e.total - e.loaded;
          const eta = speed > 0 ? remaining / speed : 0;

          onProgress({ progress, loaded: e.loaded, speed, eta });

          lastLoaded = e.loaded;
          lastTime = now;
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress({ progress: 100, loaded: file.size, speed: 0, eta: 0 });
          resolve();
        } else {
          reject(new Error(xhr.responseText || "Upload failed"));
        }
      });

      xhr.addEventListener("error", (e) => {
        console.error("XHR Error:", e);
        console.error("Failed Upload URL:", uploadUrl);
        reject(new Error("Network error"));
      });

      xhr.open("POST", uploadUrl);
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      xhr.send(file);
    });
  };

  // Resumable upload with chunking
  const uploadResumable = async (
    uploadId: string,
    file: File,
    path: string,
    chunkSize: number,
  ): Promise<boolean> => {
    const totalChunks = Math.ceil(file.size / chunkSize);
    const token = localStorage.getItem("auth-token");

    // Create upload session
    const sessionResponse = await fetch("/api/uploads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        filename: file.name,
        path,
        size: file.size,
      }),
    });

    if (!sessionResponse.ok) {
      throw new Error("Failed to create upload session");
    }

    const session = await sessionResponse.json();
    const abortController = new AbortController();
    const startTime = Date.now();

    // Store session info in ref
    uploadSessions.current.set(uploadId, {
      sessionId: session.id,
      currentChunk: 0,
      totalChunks,
      abortController,
      startTime,
    });
    // Sliding window for speed calculation (last 5 chunks)
    const speedSamples: { bytes: number; duration: number }[] = [];
    const MAX_SAMPLES = 5;

    // Upload chunks
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const sessionInfo = uploadSessions.current.get(uploadId);
      // Check if aborted
      if (!sessionInfo || abortController.signal.aborted) {
        return false;
      }

      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const chunkStartTime = Date.now();

      let retries = 3;
      while (retries > 0) {
        try {
          const chunkResponse = await fetch(
            `/api/uploads/${session.id}?chunk=${chunkIndex}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/octet-stream",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
              body: chunk,
              signal: abortController.signal,
            },
          );

          if (!chunkResponse.ok) {
            // If 5xx error, retry. If 4xx (except 429), throw.
            if (chunkResponse.status >= 500 || chunkResponse.status === 429) {
              throw new Error(`Server error: ${chunkResponse.status}`);
            }
            throw new Error(`Failed to upload chunk ${chunkIndex}: ${chunkResponse.statusText}`);
          }

          // Success - break retry loop
          break;
        } catch (error: any) {
          if (error.name === 'AbortError') {
            return false;
          }

          retries--;
          console.warn(`Chunk ${chunkIndex} failed, retries left: ${retries}`, error);

          if (retries === 0) {
            throw error;
          }

          // Wait before retry (1s, 2s, 4s)
          const waitTime = (3 - retries) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      // Calculate per-chunk speed using sliding window
      const chunkDuration = (Date.now() - chunkStartTime) / 1000;
      const chunkBytes = end - start;

      // Add sample to sliding window
      speedSamples.push({ bytes: chunkBytes, duration: chunkDuration });
      if (speedSamples.length > MAX_SAMPLES) {
        speedSamples.shift();
      }

      // Calculate speed from recent samples (sliding window average)
      const totalBytes = speedSamples.reduce((sum, s) => sum + s.bytes, 0);
      const totalDuration = speedSamples.reduce((sum, s) => sum + s.duration, 0);
      const speed = totalDuration > 0 ? totalBytes / totalDuration : 0;

      const remaining = file.size - end;
      const eta = speed > 0 ? remaining / speed : 0;

      // Update progress
      const progress = ((chunkIndex + 1) / totalChunks) * 100;
      setUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId
            ? { ...u, progress, loaded: end, speed, eta, status: "uploading" as const }
            : u,
        ),
      );

      // Update session info
      sessionInfo.currentChunk = chunkIndex + 1;
    }

    // Cleanup
    uploadSessions.current.delete(uploadId);
    return true;
  };

  const clearUploads = () => setUploads([]);

  const handlePauseUpload = (uploadId: string) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload) return;

    // Abort via AbortController
    const sessionInfo = uploadSessions.current.get(uploadId);
    if (sessionInfo) {
      sessionInfo.abortController.abort();
    }

    // Update upload status
    setUploads(prev => prev.map(u =>
      u.id === uploadId ? { ...u, status: "paused" as const } : u
    ));

    // Also abort xhr for non-resumable uploads
    const path = currentPath === "/"
      ? `/${upload.file.name}`
      : `${currentPath}/${upload.file.name}`;

    const xhr = uploadControllers.get(path);
    if (xhr) {
      xhr.abort();
    }
  };

  const handleResumeUpload = async (uploadId: string) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload) return;

    const sessionInfo = uploadSessions.current.get(uploadId);
    const CHUNK_SIZE = 5 * 1024 * 1024;
    const RESUMABLE_THRESHOLD = 10 * 1024 * 1024;

    // Update status to uploading and clear any error
    setUploads(prev => prev.map(u =>
      u.id === uploadId ? { ...u, status: "uploading" as const, error: undefined } : u
    ));

    const path = currentPath === "/"
      ? `/${upload.file.name}`
      : `${currentPath}/${upload.file.name}`;

    try {
      // If we have a session, resume from last chunk
      if (sessionInfo && upload.file.size > RESUMABLE_THRESHOLD) {
        const token = localStorage.getItem("auth-token");
        const totalChunks = sessionInfo.totalChunks;
        const startChunk = sessionInfo.currentChunk;

        // Create new AbortController for resume
        const newAbortController = new AbortController();
        sessionInfo.abortController = newAbortController;

        // Sliding window for speed calculation
        const speedSamples: { bytes: number; duration: number }[] = [];
        const MAX_SAMPLES = 5;

        // Continue uploading from where we left off
        for (let chunkIndex = startChunk; chunkIndex < totalChunks; chunkIndex++) {
          // Check if aborted again
          if (newAbortController.signal.aborted) {
            return;
          }

          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, upload.file.size);
          const chunk = upload.file.slice(start, end);
          const chunkStartTime = Date.now();

          try {
            let retries = 3;
            while (retries > 0) {
              try {
                const chunkResponse = await fetch(
                  `/api/uploads/${sessionInfo.sessionId}?chunk=${chunkIndex}`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/octet-stream",
                      ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: chunk,
                    signal: newAbortController.signal,
                  },
                );

                if (!chunkResponse.ok) {
                  if (chunkResponse.status >= 500 || chunkResponse.status === 429) {
                    throw new Error(`Server error: ${chunkResponse.status}`);
                  }
                  throw new Error(`Failed to upload chunk ${chunkIndex}`);
                }
                break; // Success
              } catch (error: any) {
                if (error.name === 'AbortError') throw error; // Don't retry aborts

                retries--;
                console.warn(`Chunk ${chunkIndex} failed, retries left: ${retries}`, error);

                if (retries === 0) throw error;
                await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
              }
            }

            // Calculate per-chunk speed using sliding window
            const chunkDuration = (Date.now() - chunkStartTime) / 1000;
            const chunkBytes = end - start;

            // Add sample to sliding window
            speedSamples.push({ bytes: chunkBytes, duration: chunkDuration });
            if (speedSamples.length > MAX_SAMPLES) {
              speedSamples.shift();
            }

            // Calculate speed from recent samples
            const totalBytes = speedSamples.reduce((sum, s) => sum + s.bytes, 0);
            const totalDuration = speedSamples.reduce((sum, s) => sum + s.duration, 0);
            const speed = totalDuration > 0 ? totalBytes / totalDuration : 0;

            const remaining = upload.file.size - end;
            const eta = speed > 0 ? remaining / speed : 0;

            // Update progress
            const progress = ((chunkIndex + 1) / totalChunks) * 100;
            setUploads((prev) =>
              prev.map((u) =>
                u.id === uploadId
                  ? { ...u, progress, loaded: end, speed, eta }
                  : u,
              ),
            );

            // Update session info
            if (sessionInfo) {
              sessionInfo.currentChunk = chunkIndex + 1;
            }
          } catch (error: any) {
            if (error.name === 'AbortError') {
              return;
            }
            throw error;
          }
        }

        // Cleanup and finish
        uploadSessions.current.delete(uploadId);

        setUploads(prev => prev.map(u =>
          u.id === uploadId ? { ...u, status: "completed" as const, progress: 100 } : u
        ));

        // Refresh file list
        const data = await filesApi.list(currentPath, sortBy, sortOrder);
        setListing(data);
      } else {
        // For non-resumable uploads or small files, re-upload from scratch
        await uploadWithProgress(path, upload.file, (data) => {
          setUploads(prev => prev.map(u =>
            u.id === uploadId ? { ...u, progress: data.progress, loaded: data.loaded, speed: data.speed, eta: data.eta } : u
          ));
        });

        setUploads(prev => prev.map(u =>
          u.id === uploadId ? { ...u, status: "completed" as const, progress: 100 } : u
        ));

        // Refresh file list after completion
        const data = await filesApi.list(currentPath, sortBy, sortOrder);
        setListing(data);
      }
    } catch (err: any) {
      setUploads(prev => prev.map(u =>
        u.id === uploadId ? { ...u, status: "error" as const, error: err.message } : u
      ));
    }
  };

  // Handle new folder creation
  const handleCreateFolder = async (folderName: string) => {
    const path =
      currentPath === "/" ? `/${folderName}/` : `${currentPath}/${folderName}/`;
    await filesApi.createDir(path);
    // Refresh file list
    const data = await filesApi.list(currentPath, sortBy, sortOrder);
    setListing(data);
  };

  // Context menu handlers
  const handleMenuOpen = (file: FileItem, anchorEl: HTMLElement) => {
    setMenuFile(file);
    setMenuAnchor(anchorEl);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuFile(null);
  };

  // File actions
  const handleDownload = async (file: FileContextMenuItem) => {
    const url = filesApi.getDownloadUrl(file.path);
    const token = localStorage.getItem("auth-token");

    try {
      toast.info("Mengunduh file...");

      // Create a hidden link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.style.display = "none";

      // Add authorization header if needed
      if (token) {
        const encodedToken = encodeURIComponent(token);
        url.includes("?")
          ? (a.href += `&token=${encodedToken}`)
          : (a.href += `?token=${encodedToken}`);
      }

      document.body.appendChild(a);

      // For cross-origin or authenticated requests, we need to use fetch first
      const response = await fetch(a.href, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        document.body.removeChild(a);
        throw new Error("Failed to download");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      a.href = blobUrl;

      // Trigger download
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 100);

      toast.success("File berhasil diunduh");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunduh file");
    }
  };

  const handlePreview = (file: FileContextMenuItem) => {
    setPreviewFile(file as FileItem);
  };

  const handleRenameOpen = (file: FileContextMenuItem) => {
    setRenameFile(file as FileItem);
  };

  const handleRename = async (newName: string) => {
    if (!renameFile) return;
    await filesApi.rename(renameFile.path, newName);
    setRenameFile(null);
    // Refresh file list
    const data = await filesApi.list(currentPath, sortBy, sortOrder);
    setListing(data);
  };

  const handleDeleteConfirm = (file: FileContextMenuItem) => {
    setDeleteFile(file);
    setDeleteFileName(file.name);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteFile) return;

    setIsDeleting(true);
    try {
      await filesApi.delete(deleteFile.path);
      setDeleteOpen(false);
      setDeleteFile(null);
      // Refresh file list
      const data = await filesApi.list(currentPath, sortBy, sortOrder);
      setListing(data);
      toast.success("File berhasil dihapus");
    } catch (err: any) {
      toast.error(err.response?.data || "Gagal menghapus file");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleHide = async (file: FileContextMenuItem) => {
    if (file.name.startsWith(".")) return;

    try {
      // New path is dir + . + name
      // Actually filesApi.rename takes current path and new NAME only
      const newName = "." + file.name;
      
      await filesApi.rename(file.path, newName);
      
      // Refresh file list
      const data = await filesApi.list(currentPath, sortBy, sortOrder);
      setListing(data);
      toast.success("File berhasil disembunyikan");
    } catch (err: any) {
      toast.error(err.response?.data || "Gagal menyembunyikan file");
    }
  };

  // Convert FileData to FileContextMenuItem for use with action handlers
  const fileDataToContextItem = (file: FileData): FileContextMenuItem => ({
    path: file.id,
    name: file.name,
    isDir: file.type === "folder",
    type: file.type,
  });

  // Handlers for FileData (used by FileList)
  const handleFileDownload = (file: FileData) =>
    handleDownload(fileDataToContextItem(file));
  const handleFileRename = (file: FileData) =>
    handleRenameOpen(fileDataToContextItem(file));
  const handleFileDelete = (file: FileData) =>
    handleDeleteConfirm(fileDataToContextItem(file));
  const handleFilePreview = (file: FileData) =>
    handlePreview(fileDataToContextItem(file));
  const handleFileHide = (file: FileData) => 
    handleHide(fileDataToContextItem(file));
  const handleFileShare = (file: FileData) => {
    setShareFile(fileDataToContextItem(file));
    setShareFileName(file.name);
    setShareUrl("");
    setShareOpen(true);
  };

  // Handler for FileItem (used by FileGrid/FileContextMenu)
  const handleItemShare = (file: FileContextMenuItem) => {
    setShareFile(file);
    setShareFileName(file.name);
    setShareUrl("");
    setShareOpen(true);
  };

  const handleCreateShare = async (expiration: {
    expires: string;
    unit: string;
  }) => {
    setIsCreatingShare(true);
    try {
      const contextItem = shareFile;
      if (!contextItem) return;

      // Create share link with expiration
      const shareLink = await filesApi.createShare(
        contextItem.path,
        contextItem.type || "file",
        expiration.expires,
        expiration.unit,
      );

      // Validate share link response
      if (!shareLink || !shareLink.token) {
        throw new Error("Invalid share link response from server");
      }

      // Generate share URL
      const url = `${window.location.origin}/share/${shareLink.token}`;
      setShareUrl(url);
    } catch (err: any) {
      console.error("Error creating share:", err);
      toast.error(err.message || "Gagal membuat link share");
    } finally {
      setIsCreatingShare(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link berhasil disalin");
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the main drop zone
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      // Robust file retrieval using items first, falling back to files
      const rawFiles: File[] = [];
      if (e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          const item = e.dataTransfer.items[i];
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) rawFiles.push(file);
          }
        }
      } else {
        rawFiles.push(...Array.from(e.dataTransfer.files));
      }

      // Clone files to ensure they persist after event loop
      // Create new File objects from blobs to decouple from DragEvent
      const files = rawFiles.map(f => new File([f.slice(0, f.size)], f.name, { type: f.type, lastModified: f.lastModified }));

      console.log('Dropped files (cloned):', files.map(f => ({ name: f.name, size: f.size })));

      if (files.length > 0) {
        handleUpload(files);
      }
    },
    [handleUpload],
  );

  const handleFileLongPress = (file: FileData) => {
    setIsMultiSelectMode(true);
    handleSelect(file.id, true);
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleGridFileLongPress = (file: FileItem) => {
    setIsMultiSelectMode(true);
    handleSelect(file.path, true);
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <Header
        onUploadClick={() => setUploadOpen(true)}
        onFolderUploadClick={() => {
          setIsFolderUpload(true);
          setUploadOpen(true);
        }}
        onNewFolderClick={() => setNewFolderOpen(true)}
        onSharesClick={() => setSharesOpen(!sharesOpen)}
      />

      {/* Main content */}
      <Box
        onContextMenu={handleBgContextMenu}
        sx={{
          flex: 1,
          display: sharesOpen ? "none" : "flex",
          gap: { xs: 2, sm: 3 },
          p: { xs: 2, sm: 3 },
          pt: { xs: 9, sm: 11 }, // Account for fixed header (56px/64px + padding)
          overflow: "hidden",
          maxWidth: "100%",
        }}
      >
        {/* Left side - Files (Drop Zone) */}
        <Box
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onContextMenu={handleBgContextMenu}
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "auto",
            position: "relative",
            borderRadius: 2,
            border: isDragging ? "2px dashed" : "2px solid transparent",
            borderColor: isDragging ? "primary.main" : "transparent",
            bgcolor: isDragging
              ? (theme) => alpha(theme.palette.primary.main, 0.05)
              : "transparent",
            transition: "all 0.2s ease",
          }}
        >
          {/* Drop overlay */}
          {isDragging && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                zIndex: 10,
                borderRadius: 1,
              }}
            >
              <CloudUpload
                sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h6" color="primary">
                Drop files here to upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Files will be uploaded to current folder
              </Typography>
            </Box>
          )}
          {/* Breadcrumb navigation */}
          <Breadcrumb
            currentPath={currentPath}
            onNavigate={handleBreadcrumbNavigate}
          />

          {/* Category filters */}
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            fileCounts={fileCounts}
          />

          {/* Folder toolbar with sort + view toggle + back + selection actions */}
          <FolderToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            numDirs={listing?.numDirs}
            numFiles={listing?.numFiles}
            isAtRoot={isAtRoot}
            onBack={handleBack}
            onSelectAll={handleSelectAll}
            onUnselectAll={handleUnselectAll}
            hasSelection={selectedFiles.length > 0}
          />

          {/* Content */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ py: 4, textAlign: "center" }}>
              {error}
            </Typography>
          ) : files.length === 0 ? (
            <Typography
              color="text.secondary"
              sx={{ py: 4, textAlign: "center" }}
            >
              Folder kosong. Upload file untuk memulai.
            </Typography>
          ) : viewMode === "list" ? (
            <FileList
              files={filteredFiles}
              selectedIds={selectedFiles}
              isMultiSelectMode={isMultiSelectMode}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onFileClick={handleFileClick}
              onFileDoubleClick={handleFileDoubleClick}
              onFileLongPress={handleFileLongPress}
              onDownload={handleFileDownload}
              onRename={handleFileRename}
              onDelete={handleFileDelete}
              onShare={handleFileShare}
              onPreview={handleFilePreview}
              onHide={handleFileHide}
              onContextMenu={handleBgContextMenu}
            />
          ) : (
            <FileGrid
              files={filteredGridFiles}
              selectedFiles={selectedFiles}
              isMultiSelectMode={isMultiSelectMode}
              onToggleSelect={handleSelect}
              onFileClick={handleGridFileClick}
              onFileDoubleClick={handleGridFileDoubleClick}
              onFileLongPress={handleGridFileLongPress}
              onMenuClick={handleMenuOpen}
              onContextMenu={handleBgContextMenu}
            />
          )}
        </Box>

        {/* Right side - Storage panel */}
        <Box
          sx={{
            display: { xs: "none", xl: "block" },
            width: 280,
            flexShrink: 0,
          }}
        >
          <StoragePanel />
        </Box>

        {/* Shares panel */}
      </Box>

      {/* Shares View - Full page when open */}
      {sharesOpen && (
        <SharesView onClose={() => setSharesOpen(false)} />
      )}

      {/* Upload modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setIsFolderUpload(false);
        }}
        onUpload={handleUpload}
        isFolder={isFolderUpload}
      />

      {/* New Folder dialog */}
      <NewFolderDialog
        open={newFolderOpen}
        onClose={() => setNewFolderOpen(false)}
        onSubmit={handleCreateFolder}
        currentPath={currentPath}
      />

      {/* Background Context Menu */}
      <BackgroundContextMenu
        open={Boolean(bgMenuAnchor)}
        onClose={handleBgMenuClose}
        anchorPosition={bgMenuAnchor}
        onNewFolder={() => setNewFolderOpen(true)}
        onUpload={() => setUploadOpen(true)}
        onRefresh={handleRefresh}
      />

      {/* Context Menu */}
      <FileContextMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        file={menuFile}
        onOpen={(f) => navigateToPath(f.path)}
        onDownload={handleDownload}
        onRename={handleRenameOpen}
        onDelete={handleDeleteConfirm}
        onPreview={handlePreview}
        onShare={handleItemShare}
        onHide={handleHide}
      />

      {/* Preview Modal */}
      <FilePreviewModal
        open={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />

      {/* Rename Dialog */}
      <RenameDialog
        open={Boolean(renameFile)}
        onClose={() => setRenameFile(null)}
        onSubmit={handleRename}
        currentName={renameFile?.name || ""}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareOpen}
        onClose={() => {
          setShareOpen(false);
          setShareUrl("");
          setShareFile(null);
        }}
        fileName={shareFileName}
        shareUrl={shareUrl}
        onCopyLink={handleCopyLink}
        onCreateShare={handleCreateShare}
        isCreating={isCreatingShare}
        fileType={(shareFile?.type === "folder" ? "folder" : "file") as "file" | "folder"}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteFile(null);
        }}
        onConfirm={handleDelete}
        fileName={deleteFileName}
        isDeleting={isDeleting}
      />

      {/* Upload Progress */}
      <UploadProgress
        uploads={uploads}
        onClose={clearUploads}
        onPause={handlePauseUpload}
        onResume={handleResumeUpload}
      />
    </Box>
  );
};

// Helper function
const formatSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default HomePage;
