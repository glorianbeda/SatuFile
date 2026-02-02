import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Chip,
    CircularProgress,
    Tooltip,
    alpha,
    useTheme,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    ArrowBack,
    ContentCopy,
    Delete,
    Share,
    Edit,
    Search,
    LinkOff,
    AccessTime,
    OpenInNew,
    Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { useToast } from '@/contexts/ToastProvider';

interface ShareLink {
    token: string;
    path: string;
    expires_at: string | null;
    userID: number;
}

interface SharesViewProps {
    onClose: () => void;
}

const SharesView: React.FC<SharesViewProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const theme = useTheme();
    const [shares, setShares] = useState<ShareLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; share: ShareLink | null }>({
        open: false,
        share: null,
    });
    const [editDialog, setEditDialog] = useState<{ open: boolean; share: ShareLink | null }>({
        open: false,
        share: null,
    });
    const [editExpires, setEditExpires] = useState('7');
    const [editUnit, setEditUnit] = useState<'hours' | 'days' | 'weeks'>('days');
    const [editLoading, setEditLoading] = useState(false);

    const loadShares = async () => {
        try {
            setLoading(true);
            const data = await api.get<ShareLink[]>('/shares');
            setShares(data || []);
        } catch (error) {
            toast.error('Gagal memuat daftar share');
            setShares([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadShares();
    }, []);

    const handleCopyToken = (token: string) => {
        const shareUrl = `${window.location.origin}/share/${token}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link share berhasil disalin!');
    };

    const handleDeleteShare = async (share: ShareLink) => {
        try {
            await api.delete(`/share?token=${share.token}`);
            toast.success('Share berhasil dihapus');
            loadShares();
        } catch (error) {
            toast.error('Gagal menghapus share');
        }
        setDeleteDialog({ open: false, share: null });
    };

    const handleEditShare = async () => {
        if (!editDialog.share) return;
        try {
            setEditLoading(true);
            await api.put('/share', {
                token: editDialog.share.token,
                expires: editExpires,
                unit: editUnit,
            });
            toast.success('Expiration berhasil diperbarui');
            loadShares();
            setEditDialog({ open: false, share: null });
        } catch (error) {
            toast.error('Gagal memperbarui expiration');
        } finally {
            setEditLoading(false);
        }
    };

    const handleViewFile = (path: string) => {
        onClose();
        navigate(`/files/${path}`);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffMs < 0) return { text: 'Expired', color: 'error' as const };
        
        // Less than 24 hours
        if (diffHours <= 24) {
            const hours = Math.floor(diffHours);
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            if (hours < 1) {
                return { text: `Sisa ${minutes} menit`, color: 'warning' as const };
            }
            return { text: `Sisa ${hours} jam`, color: 'warning' as const };
        }

        if (diffDays === 1) return { text: 'Besok', color: 'warning' as const };
        if (diffDays <= 7) return { text: `${diffDays} hari lagi`, color: 'info' as const };
        
        // Show specific date and time for longer durations
        const dateString = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        const timeString = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        return {
            text: `${dateString}, ${timeString}`,
            color: 'default' as const
        };
    };

    const getFileName = (path: string) => {
        const parts = path.split('/');
        return parts[parts.length - 1] || path;
    };

    const filteredShares = shares.filter((share) =>
        share.path.toLowerCase().includes(searchText.toLowerCase()) ||
        share.token.toLowerCase().includes(searchText.toLowerCase())
    );

    const paginatedShares = filteredShares.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{ flex: 1, overflow: 'auto', pt: { xs: 7, sm: 8 } }}>
            {/* Header - Floating/Sticky */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: { xs: 2, sm: 3 },
                    py: 2,
                }}
            >
                <IconButton onClick={onClose}>
                    <ArrowBack />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight="bold">
                        Kelola Share
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {shares.length} link share aktif
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
                    onClick={loadShares}
                    disabled={loading}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                        },
                    }}
                >
                    Refresh
                </Button>
            </Box>

            {/* Content */}
            <Box sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    {/* Search Bar */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <TextField
                            fullWidth
                            placeholder="Cari file atau token..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '& fieldset': {
                                        borderColor: 'divider',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                        />
                    </Box>

                    {/* Table */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredShares.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <LinkOff sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                {searchText ? 'Tidak ada hasil' : 'Belum ada share'}
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                                {searchText ? 'Coba keyword lain' : 'Share file untuk memulai'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                                File / Folder
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                                Token
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                                Kadaluarsa
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                                Aksi
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedShares.map((share) => {
                                            const expiry = formatDate(share.expires_at);
                                            return (
                                                <TableRow
                                                    key={share.token}
                                                    sx={{
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                        },
                                                        transition: 'background-color 0.2s',
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Box
                                                                sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    borderRadius: 2,
                                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                <Share sx={{ fontSize: 18, color: 'primary.main' }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={500}>
                                                                    {getFileName(share.path)}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                                                                    {share.path}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={share.token.substring(0, 8) + '...'}
                                                            size="small"
                                                            onClick={() => handleCopyToken(share.token)}
                                                            sx={{
                                                                fontFamily: 'monospace',
                                                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                                                color: 'info.main',
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    bgcolor: alpha(theme.palette.info.main, 0.2),
                                                                },
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {expiry ? (
                                                            <Chip
                                                                icon={<AccessTime sx={{ fontSize: 14 }} />}
                                                                label={expiry.text}
                                                                size="small"
                                                                color={expiry.color}
                                                                variant="outlined"
                                                                sx={{ fontWeight: 500 }}
                                                            />
                                                        ) : (
                                                            <Typography variant="body2" color="text.disabled">
                                                                Tidak ada
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                            <Tooltip title="Salin Link">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleCopyToken(share.token)}
                                                                    sx={{ color: 'text.secondary' }}
                                                                >
                                                                    <ContentCopy fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Buka File">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleViewFile(share.path)}
                                                                    sx={{ color: 'text.secondary' }}
                                                                >
                                                                    <OpenInNew fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Ubah Expiration">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        setEditExpires('7');
                                                                        setEditUnit('days');
                                                                        setEditDialog({ open: true, share });
                                                                    }}
                                                                    sx={{ color: 'text.secondary' }}
                                                                >
                                                                    <Edit fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Hapus Share">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => setDeleteDialog({ open: true, share })}
                                                                    sx={{
                                                                        color: 'text.secondary',
                                                                        '&:hover': { color: 'error.main' },
                                                                    }}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={filteredShares.length}
                                page={page}
                                onPageChange={(_, newPage) => setPage(newPage)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setPage(0);
                                }}
                                rowsPerPageOptions={[5, 10, 25]}
                                labelRowsPerPage="Per halaman:"
                            />
                        </>
                    )}
                </Paper>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, share: null })}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle>Hapus Share?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Apakah Anda yakin ingin menghapus share untuk "
                        <strong>{deleteDialog.share?.path}</strong>"? Link tidak akan bisa diakses lagi.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, share: null })}>Batal</Button>
                    <Button
                        onClick={() => deleteDialog.share && handleDeleteShare(deleteDialog.share)}
                        color="error"
                        variant="contained"
                    >
                        Hapus
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Expiration Dialog */}
            <Dialog
                open={editDialog.open}
                onClose={() => setEditDialog({ open: false, share: null })}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle>Perpanjang Share</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Tambah waktu expiration untuk "<strong>{editDialog.share?.path}</strong>"
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <TextField
                            label="Durasi"
                            type="number"
                            value={editExpires}
                            onChange={(e) => setEditExpires(e.target.value)}
                            size="small"
                            sx={{ width: 100 }}
                            inputProps={{ min: 1 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Unit</InputLabel>
                            <Select
                                value={editUnit}
                                label="Unit"
                                onChange={(e) => setEditUnit(e.target.value as 'hours' | 'days' | 'weeks')}
                            >
                                <MenuItem value="hours">Jam</MenuItem>
                                <MenuItem value="days">Hari</MenuItem>
                                <MenuItem value="weeks">Minggu</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1 }}>
                    <Button onClick={() => setEditDialog({ open: false, share: null })}>Batal</Button>
                    <Button
                        onClick={handleEditShare}
                        variant="contained"
                        disabled={editLoading}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                            },
                        }}
                    >
                        {editLoading ? <CircularProgress size={20} /> : 'Simpan'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SharesView;
