import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, alpha } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { Header, StoragePanel } from '../../components/layout';
import {
    FileList,
    CategoryFilter,
    UploadModal,
    UploadProgress,
} from '../../components/files';
import type { UploadItem } from '../../components/files';
import { FolderToolbar, type ViewMode, type SortOption, type SortOrder } from '../../components/files/FolderToolbar';
import { FileGrid, type FileItem } from '../../components/files/FileGrid';
import { Breadcrumb } from '../../components/files/Breadcrumb';
import { NewFolderDialog } from '../../components/files/NewFolderDialog';
import { FileContextMenu, type FileContextMenuItem } from '../../components/files/FileContextMenu';
import { FilePreviewModal } from '../../components/files/FilePreviewModal';
import { RenameDialog } from '../../components/files/RenameDialog';
import { filesApi, type DirectoryListing } from '../../api';
import type { FileData } from '../../components/files';

export const HomePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [uploadOpen, setUploadOpen] = useState(false);
    const [newFolderOpen, setNewFolderOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | undefined>();

    // Context menu state
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [menuFile, setMenuFile] = useState<FileItem | null>(null);

    // Preview modal state
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

    // Rename dialog state
    const [renameFile, setRenameFile] = useState<FileItem | null>(null);

    // View and sort state
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    // Upload progress state
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [isFolderUpload, setIsFolderUpload] = useState(false);

    // Derive current path from URL
    const currentPath = useMemo(() => {
        const path = location.pathname;
        if (path === '/' || path === '/files') return '/';
        if (path.startsWith('/files/')) {
            return '/' + path.slice(7); // Remove '/files/' prefix
        }
        return '/';
    }, [location.pathname]);

    // API state
    const [listing, setListing] = useState<DirectoryListing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Navigate to a path (updates URL)
    const navigateToPath = useCallback((path: string) => {
        if (path === '/') {
            navigate('/');
        } else {
            navigate('/files' + path);
        }
    }, [navigate]);

    // Fetch files from API
    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await filesApi.list(currentPath, sortBy, sortOrder);
                setListing(data);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load files');
            } finally {
                setLoading(false);
            }
        };
        fetchFiles();
    }, [currentPath, sortBy, sortOrder]);

    // Convert API FileInfo to FileData for components
    const files: FileData[] = listing?.items?.map((item) => ({
        id: item.path,
        name: item.name,
        type: item.isDir ? 'folder' as const : 'file' as const,
        extension: item.extension || '',
        size: formatSize(item.size),
        modifiedAt: new Date(item.modified).toLocaleDateString(),
        owner: 'Me',
    })) || [];

    // Convert for FileGrid
    const gridFiles: FileItem[] = listing?.items?.map((item) => ({
        path: item.path,
        name: item.name,
        size: item.size,
        modified: item.modified,
        isDir: item.isDir,
        type: item.type,
        extension: item.extension,
    })) || [];

    // Category type detection helper
    const getCategoryType = (ext: string, type?: string): string | undefined => {
        // Strip leading dot if present (.png -> png)
        let extLower = ext?.toLowerCase() || '';
        if (extLower.startsWith('.')) extLower = extLower.slice(1);

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extLower)) return 'image';
        if (['mp4', 'webm', 'avi', 'mov', 'mkv', 'wmv', 'flv'].includes(extLower)) return 'video';
        if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(extLower)) return 'audio';
        if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt'].includes(extLower)) return 'documents';
        if (type === 'image' || type === 'video' || type === 'audio') return type;
        return undefined;
    };

    // Extract extension from filename
    const getExtFromName = (name: string): string => {
        const parts = name.split('.');
        return parts.length > 1 ? parts[parts.length - 1] : '';
    };

    // Filtered files based on activeCategory
    const filteredFiles = useMemo(() => {
        if (!activeCategory) return files;
        return files.filter(f => {
            if (f.type === 'folder') return true; // Always show folders
            const ext = f.extension || getExtFromName(f.name);
            return getCategoryType(ext) === activeCategory;
        });
    }, [files, activeCategory]);

    const filteredGridFiles = useMemo(() => {
        if (!activeCategory) return gridFiles;
        return gridFiles.filter(f => {
            if (f.isDir) return true; // Always show folders
            const ext = f.extension || getExtFromName(f.name);
            return getCategoryType(ext, f.type) === activeCategory;
        });
    }, [gridFiles, activeCategory]);

    // Calculate file counts per category
    const fileCounts = useMemo(() => {
        const counts = { documents: 0, image: 0, video: 0, audio: 0, total: 0 };
        gridFiles.forEach(f => {
            if (f.isDir) return;
            counts.total++;
            const ext = f.extension || getExtFromName(f.name);
            const cat = getCategoryType(ext, f.type);
            if (cat && cat in counts) counts[cat as keyof typeof counts]++;
        });
        return counts;
    }, [gridFiles]);

    const handleSelect = (id: string) => {
        setSelectedFiles((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedFiles.length === files.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(files.map((f) => f.id));
        }
    };

    const handleFileClick = (file: FileData) => {
        if (file.type === 'folder') {
            navigateToPath(file.id);
        } else {
            // Convert FileData to FileItem format and open preview
            const previewItem: FileItem = {
                path: file.id,
                name: file.name,
                size: typeof file.size === 'number' ? file.size : 0,
                modified: file.modifiedAt || '',
                isDir: false,
                type: file.type,
                extension: file.name.split('.').pop(),
            };
            setPreviewFile(previewItem);
        }
    };

    const handleGridFileClick = (file: FileItem) => {
        if (file.isDir) {
            navigateToPath(file.path);
        } else {
            // Open preview for files
            setPreviewFile(file);
        }
    };

    const handleSortChange = (by: SortOption, order: SortOrder) => {
        setSortBy(by);
        setSortOrder(order);
    };

    // Navigation handlers
    const handleBack = () => {
        if (currentPath === '/') return;
        const segments = currentPath.split('/').filter(s => s);
        segments.pop();
        navigateToPath(segments.length === 0 ? '/' : '/' + segments.join('/'));
    };

    const handleBreadcrumbNavigate = (path: string) => {
        navigateToPath(path);
    };

    const isAtRoot = currentPath === '/';

    const handleUpload = async (uploadFiles: File[]) => {
        // Create upload items
        const newUploads: UploadItem[] = uploadFiles.map((file, idx) => ({
            id: `upload-${Date.now()}-${idx}`,
            file,
            progress: 0,
            status: 'pending' as const,
        }));

        setUploads((prev) => [...prev, ...newUploads]);

        // Upload each file with progress tracking
        for (const upload of newUploads) {
            const path = currentPath === '/'
                ? `/${upload.file.name}`
                : `${currentPath}/${upload.file.name}`;

            // Update status to uploading
            setUploads((prev) =>
                prev.map((u) =>
                    u.id === upload.id ? { ...u, status: 'uploading' as const } : u
                )
            );

            try {
                await uploadWithProgress(path, upload.file, (data) => {
                    setUploads((prev) =>
                        prev.map((u) =>
                            u.id === upload.id
                                ? { ...u, progress: data.progress, loaded: data.loaded, speed: data.speed, eta: data.eta }
                                : u
                        )
                    );
                });

                // Mark as completed
                setUploads((prev) =>
                    prev.map((u) =>
                        u.id === upload.id
                            ? { ...u, status: 'completed' as const, progress: 100 }
                            : u
                    )
                );
            } catch (err: any) {
                // Mark as error
                setUploads((prev) =>
                    prev.map((u) =>
                        u.id === upload.id
                            ? { ...u, status: 'error' as const, error: err.message }
                            : u
                    )
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
        onProgress: (data: { progress: number; loaded: number; speed: number; eta: number }) => void
    ): Promise<void> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const startTime = Date.now();
            let lastLoaded = 0;
            let lastTime = startTime;

            // Real progress tracking from XHR upload events
            xhr.upload.addEventListener('progress', (e) => {
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

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    onProgress({ progress: 100, loaded: file.size, speed: 0, eta: 0 });
                    resolve();
                } else {
                    reject(new Error(xhr.responseText || 'Upload failed'));
                }
            });

            xhr.addEventListener('error', () => reject(new Error('Network error')));

            // Encode path properly (keep / but encode special chars)
            const encodedPath = encodeURIComponent(path).replace(/%2F/g, '/');
            const token = localStorage.getItem('auth-token');

            xhr.open('POST', `/api/resources${encodedPath}`);
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
            // Send file directly as body (like filebrowser approach)
            xhr.send(file);
        });
    };

    const clearUploads = () => setUploads([]);

    // Handle new folder creation
    const handleCreateFolder = async (folderName: string) => {
        const path = currentPath === '/' ? `/${folderName}/` : `${currentPath}/${folderName}/`;
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
    const handleDownload = (file: FileContextMenuItem) => {
        const url = filesApi.getDownloadUrl(file.path);
        window.open(url, '_blank');
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

    const handleDelete = async (file: FileContextMenuItem) => {
        if (!confirm(`Hapus "${file.name}"?`)) return;
        try {
            await filesApi.delete(file.path);
            // Refresh file list
            const data = await filesApi.list(currentPath, sortBy, sortOrder);
            setListing(data);
        } catch (err: any) {
            alert(err.response?.data || 'Gagal menghapus file');
        }
    };


    // Drag and drop handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes('Files')) {
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

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await handleUpload(files);
        }
    }, [handleUpload]);

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'hidden',
        }}>
            {/* Header */}
            <Header
                onUploadClick={() => setUploadOpen(true)}
                onFolderUploadClick={() => { setIsFolderUpload(true); setUploadOpen(true); }}
                onNewFolderClick={() => setNewFolderOpen(true)}
            />

            {/* Main content */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                gap: { xs: 2, sm: 3 },
                p: { xs: 2, sm: 3 },
                overflow: 'hidden',
                maxWidth: '100%',
            }}>
                {/* Left side - Files (Drop Zone) */}
                <Box
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'auto',
                        position: 'relative',
                        borderRadius: 2,
                        border: isDragging ? '2px dashed' : '2px solid transparent',
                        borderColor: isDragging ? 'primary.main' : 'transparent',
                        bgcolor: isDragging ? (theme) => alpha(theme.palette.primary.main, 0.05) : 'transparent',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {/* Drop overlay */}
                    {isDragging && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                                zIndex: 10,
                                borderRadius: 1,
                            }}
                        >
                            <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
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

                    {/* Folder toolbar with sort + view toggle + back */}
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
                    />

                    {/* Content */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error" sx={{ py: 4, textAlign: 'center' }}>
                            {error}
                        </Typography>
                    ) : files.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                            Folder kosong. Upload file untuk memulai.
                        </Typography>
                    ) : viewMode === 'list' ? (
                        <FileList
                            files={filteredFiles}
                            selectedIds={selectedFiles}
                            onSelect={handleSelect}
                            onSelectAll={handleSelectAll}
                            onFileClick={handleFileClick}
                        />
                    ) : (
                        <FileGrid
                            files={filteredGridFiles}
                            selectedFiles={selectedFiles}
                            onToggleSelect={handleSelect}
                            onFileClick={handleGridFileClick}
                            onMenuClick={handleMenuOpen}
                        />
                    )}
                </Box>

                {/* Right side - Storage panel */}
                <Box sx={{
                    display: { xs: 'none', xl: 'block' },
                    width: 280,
                    flexShrink: 0
                }}>
                    <StoragePanel />
                </Box>
            </Box>

            {/* Upload modal */}
            <UploadModal
                open={uploadOpen}
                onClose={() => { setUploadOpen(false); setIsFolderUpload(false); }}
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

            {/* Context Menu */}
            <FileContextMenu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                file={menuFile}
                onOpen={(f) => navigateToPath(f.path)}
                onDownload={handleDownload}
                onRename={handleRenameOpen}
                onDelete={handleDelete}
                onPreview={handlePreview}
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
                currentName={renameFile?.name || ''}
            />

            {/* Upload Progress */}
            <UploadProgress
                uploads={uploads}
                onClose={clearUploads}
            />
        </Box>
    );
};

// Helper function
const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default HomePage;
