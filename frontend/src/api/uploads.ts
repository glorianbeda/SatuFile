import axios from 'axios';

const API_BASE = '/api';

export interface UploadSession {
  id: string;
  filename: string;
  path: string;
  total_size: number;
  uploaded_size: number;
  chunk_size: number;
  total_chunks: number;
  uploaded_chunks: number;
  status: 'uploading' | 'paused' | 'completed' | 'failed';
  temp_dir: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export const uploadsApi = {
  // Create a new upload session
  createSession: async (filename: string, path: string, size: number): Promise<UploadSession> => {
    const response = await axios.post(`${API_BASE}/uploads`, {
      filename,
      path,
      size,
    });
    return response.data;
  },

  // Upload a single chunk
  uploadChunk: async (sessionId: string, chunkIndex: number, chunkData: Blob): Promise<UploadSession> => {
    const response = await axios.patch(
      `${API_BASE}/uploads/${sessionId}?chunk=${chunkIndex}`,
      chunkData,
      {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      }
    );
    return response.data;
  },

  // Get upload progress
  getProgress: async (sessionId: string): Promise<UploadSession> => {
    const response = await axios.get(`${API_BASE}/uploads/${sessionId}`);
    return response.data;
  },

  // Cancel upload
  cancelUpload: async (sessionId: string): Promise<void> => {
    await axios.delete(`${API_BASE}/uploads/${sessionId}`);
  },
};
