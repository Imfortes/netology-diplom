import apiClient from './client';

export interface FileItem {
  id: number;
  original_name: string;
  size: number;
  size_display: string;
  comment: string;
  upload_date: string;
  last_download_date: string | null;
  mime_type: string;
  file_url: string;
  share_url: string | null;
}

export const getFiles = async (userId?: number): Promise<FileItem[]> => {
  const url = userId ? `/files/?user_id=${userId}` : '/files/';
  const response = await apiClient.get(url);
  return response.data;
};

export const uploadFile = async (file: File, comment: string = ''): Promise<FileItem> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('comment', comment);

  const response = await apiClient.post('/files/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteFile = async (fileId: number): Promise<void> => {
  await apiClient.delete(`/files/${fileId}/`);
};

export const renameFile = async (fileId: number, newName: string): Promise<FileItem> => {
  const response = await apiClient.put(`/files/${fileId}/rename/`, { original_name: newName });
  return response.data;
};

export const updateComment = async (fileId: number, comment: string): Promise<FileItem> => {
  const response = await apiClient.put(`/files/${fileId}/comment/`, { comment });
  return response.data;
};

export const generateShareLink = async (fileId: number): Promise<string> => {
  const response = await apiClient.post(`/files/${fileId}/share/`);
  // Бэкенд возвращает { share_link: "/api/share/token/" }
  const sharePath = response.data.share_link;

  // Базовый URL бэкенда (без /api)
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // Формируем правильный полный URL
  return `${backendUrl}${sharePath}`;
};

export const getDownloadUrl = (fileId: number): string => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  return `${backendUrl}/api/files/${fileId}/download/`;
};