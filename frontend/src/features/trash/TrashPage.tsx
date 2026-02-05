import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Checkbox, 
    IconButton, Button, Tooltip, Container,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import { 
    RestoreFromTrash, 
    DeleteForever, 
    Delete 
} from '@mui/icons-material';
import { filesApi } from '@/api/files';
import { useToast } from '@/contexts/ToastProvider';

interface TrashItem {
    id: number;
    name: string;
    original_path: string;
    deleted_at: string;
    file_size: number;
    is_directory: boolean;
}

export const TrashPage = () => {
    const [items, setItems] = useState<TrashItem[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
    const toast = useToast();

    // Fetch items
    const fetchTrash = async () => {
        setLoading(true);
        try {
             const data = await filesApi.getTrash();
             setItems(data);
        } catch (error) {
             console.error(error);
             toast.error("Failed to load trash");
        } finally {
             setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelected(items.map(n => n.id));
        } else {
            setSelected([]);
        }
    };

    const handleSelect = (id: number) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: number[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const handleRestore = async (ids: number[]) => {
        // Restore loop
        try {
            // Restore sequentially to avoid race conditions or overload
            // Could be parallelized but robust is better
            for (const id of ids) {
                await filesApi.restoreTrash(id);
            }
            toast.success(`${ids.length} item(s) restored`);
            fetchTrash();
            setSelected([]);
        } catch (error) {
            toast.error("Failed to restore some items");
            fetchTrash(); // Refresh to see what's left
        }
    };

    const handleDelete = async (ids: number[]) => {
        if (!window.confirm(`Are you sure you want to permanently delete ${ids.length} item(s)?`)) return;
        
        try {
            for (const id of ids) {
                await filesApi.deleteTrash(id);
            }
            toast.success(`${ids.length} item(s) deleted permanently`);
            fetchTrash();
            setSelected([]);
        } catch (error) {
            toast.error("Failed to delete some items");
            fetchTrash();
        }
    };

    const handleEmptyTrash = async () => {
        try {
            await filesApi.emptyTrash();
            toast.success("Trash emptied");
            fetchTrash();
            setConfirmEmptyOpen(false);
            setSelected([]);
        } catch (error) {
            toast.error("Failed to empty trash");
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
             {/* Header with actions */}
             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                 <Typography variant="h4" fontWeight="bold">Trash</Typography>
                 <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<DeleteForever />}
                    onClick={() => setConfirmEmptyOpen(true)}
                    disabled={items.length === 0}
                 >
                     Empty Trash
                 </Button>
             </Box>
             
             {/* Toolbar for selection */}
             {selected.length > 0 && (
                 <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                     <Typography variant="subtitle1" fontWeight="bold">{selected.length} selected</Typography>
                     <Box sx={{ flexGrow: 1 }} />
                     <Tooltip title="Restore Selected">
                         <IconButton color="inherit" onClick={() => handleRestore(selected)}>
                             <RestoreFromTrash />
                         </IconButton>
                     </Tooltip>
                     <Tooltip title="Delete Permanently">
                         <IconButton color="inherit" onClick={() => handleDelete(selected)}>
                             <DeleteForever />
                         </IconButton>
                     </Tooltip>
                 </Paper>
             )}

             <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
                 <Table stickyHeader>
                     <TableHead>
                         <TableRow>
                             <TableCell padding="checkbox">
                                 <Checkbox
                                     indeterminate={selected.length > 0 && selected.length < items.length}
                                     checked={items.length > 0 && selected.length === items.length}
                                     onChange={handleSelectAll}
                                 />
                             </TableCell>
                             <TableCell>Name</TableCell>
                             <TableCell>Original Path</TableCell>
                             <TableCell>Deleted Date</TableCell>
                             <TableCell align="right">Actions</TableCell>
                         </TableRow>
                     </TableHead>
                     <TableBody>
                         {items.map((item) => {
                             const isSelected = selected.indexOf(item.id) !== -1;
                             return (
                                 <TableRow 
                                     key={item.id}
                                     hover
                                     selected={isSelected}
                                 >
                                     <TableCell padding="checkbox">
                                         <Checkbox
                                             checked={isSelected}
                                             onChange={() => handleSelect(item.id)}
                                         />
                                     </TableCell>
                                     <TableCell>{item.name}</TableCell>
                                     <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                         {item.original_path}
                                     </TableCell>
                                     <TableCell>
                                         {new Date(item.deleted_at).toLocaleString()}
                                     </TableCell>
                                     <TableCell align="right">
                                         <Tooltip title="Restore">
                                             <IconButton onClick={() => handleRestore([item.id])}>
                                                 <RestoreFromTrash />
                                             </IconButton>
                                         </Tooltip>
                                         <Tooltip title="Delete Forever">
                                             <IconButton color="error" onClick={() => handleDelete([item.id])}>
                                                 <DeleteForever />
                                             </IconButton>
                                         </Tooltip>
                                     </TableCell>
                                 </TableRow>
                             );
                         })}
                         {items.length === 0 && !loading && (
                             <TableRow>
                                 <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                     <Delete sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                     <Typography color="text.secondary">Trash is empty</Typography>
                                 </TableCell>
                             </TableRow>
                         )}
                     </TableBody>
                 </Table>
             </TableContainer>

             {/* Empty Confirm Dialog */}
             <Dialog open={confirmEmptyOpen} onClose={() => setConfirmEmptyOpen(false)}>
                <DialogTitle>Empty Trash?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently delete ALL items in the trash? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmEmptyOpen(false)}>Cancel</Button>
                    <Button onClick={handleEmptyTrash} color="error" autoFocus>Empty Trash</Button>
                </DialogActions>
             </Dialog>
        </Container>
    );
};
