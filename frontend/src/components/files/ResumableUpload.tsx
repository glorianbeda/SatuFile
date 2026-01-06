import React, { useState, useEffect } from 'react';
import {
    Box,
    LinearProgress,
    Typography,
    IconButton,
    Card,
    CardContent,
    Stack,
} from '@mui/material';
import { Pause, PlayArrow, Close } from '@mui/icons-material';
import { uploadsApi, type UploadSession } from '../../api/uploads';

interface ResumableUploadProps {
    file: File;
    path: string;
    onComplete: () => void;
    onCancel: () => void;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export const ResumableUpload: React.FC<ResumableUploadProps> = ({
    file,
    path,
    onComplete,
    onCancel,
}) => {
    const [session, setSession] = useState<UploadSession | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize upload session
        const initUpload = async () => {
            try {
                const newSession = await uploadsApi.createSession(
                    file.name,
                    `${path}/${file.name}`,
                    file.size
                );
                setSession(newSession);

                // Save to localStorage for recovery
                localStorage.setItem(`upload_${newSession.id}`, JSON.stringify({
                    sessionId: newSession.id,
                    filename: file.name,
                    path,
                    currentChunk: 0,
                }));

                // Start uploading
                uploadNextChunk(newSession, 0);
            } catch (err: any) {
                setError(err.message || 'Failed to start upload');
            }
        };

        initUpload();
    }, [file, path]);

    const uploadNextChunk = async (uploadSession: UploadSession, chunkIndex: number) => {
        if (isPaused || chunkIndex >= uploadSession.total_chunks) {
            return;
        }

        try {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const updatedSession = await uploadsApi.uploadChunk(
                uploadSession.id,
                chunkIndex,
                chunk
            );

            setSession(updatedSession);
            setCurrentChunk(chunkIndex + 1);

            // Update localStorage
            localStorage.setItem(`upload_${uploadSession.id}`, JSON.stringify({
                sessionId: uploadSession.id,
                filename: file.name,
                path,
                currentChunk: chunkIndex + 1,
            }));

            // Check if completed
            if (updatedSession.status === 'completed') {
                // Cleanup localStorage
                localStorage.removeItem(`upload_${uploadSession.id}`);
                onComplete();
            } else {
                // Upload next chunk
                setTimeout(() => uploadNextChunk(updatedSession, chunkIndex + 1), 100);
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        }
    };

    const handlePause = () => {
        setIsPaused(true);
    };

    const handleResume = () => {
        setIsPaused(false);
        if (session) {
            uploadNextChunk(session, currentChunk);
        }
    };

    const handleCancel = async () => {
        if (session) {
            try {
                await uploadsApi.cancelUpload(session.id);
                localStorage.removeItem(`upload_${session.id}`);
            } catch (err) {
                console.error('Failed to cancel upload:', err);
            }
        }
        onCancel();
    };

    if (!session) {
        return (
            <Card>
                <CardContent>
                    <Typography>Initializing upload...</Typography>
                    <LinearProgress />
                </CardContent>
            </Card>
        );
    }

    const progress = (session.uploaded_chunks / session.total_chunks) * 100;

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" noWrap sx={{ flex: 1 }}>
                            {file.name}
                        </Typography>
                        <Box display="flex" gap={1}>
                            {!isPaused ? (
                                <IconButton size="small" onClick={handlePause} title="Pause">
                                    <Pause />
                                </IconButton>
                            ) : (
                                <IconButton size="small" onClick={handleResume} title="Resume">
                                    <PlayArrow />
                                </IconButton>
                            )}
                            <IconButton size="small" onClick={handleCancel} title="Cancel">
                                <Close />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" color="text.secondary">
                                Chunk {session.uploaded_chunks}/{session.total_chunks}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {progress.toFixed(1)}%
                            </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress} />
                    </Box>

                    {error && (
                        <Typography variant="caption" color="error">
                            {error}
                        </Typography>
                    )}

                    {isPaused && (
                        <Typography variant="caption" color="warning.main">
                            Upload paused
                        </Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};
