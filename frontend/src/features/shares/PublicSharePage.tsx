import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Download,
  Visibility,
  Share,
  Error as ErrorIcon,
  Folder,
  InsertDriveFile,
  ArrowBack,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/api';

interface FileInfo {
  path: string;
  name: string;
  size: number;
  isDir: boolean;
  extension: string;
  type: string;
}

interface ShareInfo {
  token: string;
  path: string;
  name: string;
  type: string;
  size: number;
  expires_at: string;
  expires: string;
  isDir: boolean;
  subpath?: string;
  items?: FileInfo[];
  numDirs?: number;
  numFiles?: number;
}

const PublicSharePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSubpath, setCurrentSubpath] = useState('');

  const loadShareInfo = useCallback(async (subpath: string = '') => {
    try {
      setLoading(true);
      const url = subpath
        ? `/share/public?token=${token}&subpath=${encodeURIComponent(subpath)}`
        : `/share/public?token=${token}`;
      const data = await api.get<ShareInfo>(url);
      setShareInfo(data);
      setCurrentSubpath(subpath);
    } catch (err) {
      setError('Link share tidak valid atau telah kadaluarsa');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadShareInfo();
    }
  }, [token, loadShareInfo]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Tidak ada';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = (subpath?: string) => {
    const downloadPath = subpath
      ? `/api/share/public?token=${token}&subpath=${encodeURIComponent(subpath)}&download=true`
      : `/api/share/public?token=${token}&download=true`;
    window.location.href = downloadPath;
  };

  const handleNavigateFolder = (itemPath: string) => {
    // Extract relative path from the shared folder
    const basePath = shareInfo?.path || '';
    const relativePath = itemPath.startsWith(basePath)
      ? itemPath.substring(basePath.length).replace(/^\//, '')
      : itemPath;
    loadShareInfo(relativePath);
  };

  const handleBreadcrumbClick = (index: number) => {
    const parts = currentSubpath.split('/').filter(Boolean);
    const newSubpath = parts.slice(0, index).join('/');
    loadShareInfo(newSubpath);
  };

  const isExpired = shareInfo?.expires && new Date(shareInfo.expires) < new Date();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || isExpired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {isExpired ? 'Link Share Kadaluarsa' : 'Link Share Tidak Valid'}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {error || 'Link share ini telah kadaluarsa'}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Login ke SatuFile
          </Button>
        </Paper>
      </Box>
    );
  }

  const pathParts = currentSubpath.split('/').filter(Boolean);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 4,
          mb: 4,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Share sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                SatuFile Share
              </Typography>
              <Typography variant="body2">
                File dibagikan oleh pengguna
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md">
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Visibility />
            {shareInfo?.isDir ? 'Folder Tersedia' : 'File Tersedia'}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Breadcrumbs for folder navigation */}
          {shareInfo?.isDir && (
            <Box sx={{ mb: 2 }}>
              <Breadcrumbs>
                <Link
                  component="button"
                  underline="hover"
                  color={pathParts.length === 0 ? 'text.primary' : 'inherit'}
                  onClick={() => loadShareInfo('')}
                  sx={{ cursor: 'pointer' }}
                >
                  {shareInfo?.name || 'Root'}
                </Link>
                {pathParts.map((part, index) => (
                  <Link
                    key={index}
                    component="button"
                    underline="hover"
                    color={index === pathParts.length - 1 ? 'text.primary' : 'inherit'}
                    onClick={() => handleBreadcrumbClick(index + 1)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {part}
                  </Link>
                ))}
              </Breadcrumbs>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Nama {shareInfo?.isDir ? 'Folder' : 'File'}
            </Typography>
            <Typography variant="h6">{shareInfo?.name || shareInfo?.path}</Typography>
            {!shareInfo?.isDir && shareInfo?.size && (
              <Typography variant="body2" color="text.secondary">
                Ukuran: {formatSize(shareInfo.size)}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Tipe
            </Typography>
            <Chip
              label={shareInfo?.isDir ? 'Folder' : 'File'}
              color={shareInfo?.isDir ? 'info' : 'primary'}
              size="small"
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Kadaluarsa
            </Typography>
            <Typography variant="body1">{formatDate(shareInfo?.expires_at || null)}</Typography>
          </Box>

          {/* Folder contents */}
          {shareInfo?.isDir && shareInfo?.items && shareInfo.items.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Isi Folder ({shareInfo.numDirs} folder, {shareInfo.numFiles} file)
              </Typography>
              <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List dense>
                  {currentSubpath && (
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => {
                        const parts = currentSubpath.split('/').filter(Boolean);
                        parts.pop();
                        loadShareInfo(parts.join('/'));
                      }}>
                        <ListItemIcon>
                          <ArrowBack />
                        </ListItemIcon>
                        <ListItemText primary=".." secondary="Kembali" />
                      </ListItemButton>
                    </ListItem>
                  )}
                  {shareInfo.items.map((item) => (
                    <ListItem key={item.path} disablePadding>
                      <ListItemButton
                        onClick={() => {
                          if (item.isDir) {
                            handleNavigateFolder(item.path);
                          } else {
                            // Build subpath for this file
                            const basePath = shareInfo?.path || '';
                            const relativePath = item.path.startsWith(basePath)
                              ? item.path.substring(basePath.length).replace(/^\//, '')
                              : item.path;
                            handleDownload(relativePath);
                          }
                        }}
                      >
                        <ListItemIcon>
                          {item.isDir ? <Folder color="primary" /> : <InsertDriveFile />}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.name}
                          secondary={item.isDir ? 'Folder' : formatSize(item.size)}
                        />
                        {!item.isDir && (
                          <Download fontSize="small" color="action" />
                        )}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}

          <Alert severity="info" sx={{ mb: 3 }}>
            {shareInfo?.isDir
              ? 'Folder ini dibagikan secara publik. Anda dapat menjelajah dan mengunduh file tanpa login.'
              : 'File ini dibagikan secara publik. Anda dapat mengunduhnya tanpa login.'
            }
          </Alert>

          {!shareInfo?.isDir && (
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<Download />}
              onClick={() => handleDownload()}
            >
              Unduh File
            </Button>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              SatuFile - Cloud Drive Solution
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicSharePage;

