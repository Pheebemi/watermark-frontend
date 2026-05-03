import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL,
});

export interface UploadedPhoto {
  id: number;
  original_name: string;
  watermarked_url: string;
}

export interface UploadResponse {
  success: boolean;
  data: {
    processed: UploadedPhoto[];
    errors: { file: string; error: string }[];
    total: number;
  };
}

export const uploadPhotos = async (
  files: File[],
  onProgress?: (percent: number) => void
): Promise<UploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await api.post<UploadResponse>('/photos/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

  return response.data;
};

export const downloadZip = async (ids: number[]): Promise<void> => {
  const response = await api.post(
    '/photos/download-zip/',
    { ids },
    { responseType: 'blob' }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'church_photos.zip');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
