import { apiClient } from './apiClient';

export interface DocumentItem {
  id: string;
  user_id: string;
  original_name: string;
  source_type: 'PDF' | 'WEBSITE' | 'YOUTUBE' | 'TEXT' | 'GIT';
  source_url?: string | null;
  git_branch?: string | null;
  git_commit_hash?: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  failure_reason?: string | null;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  documents: DocumentItem[];
  total: number;
}

export const fetchDocuments = async (sourceType?: string): Promise<DocumentItem[]> => {
  const params = sourceType && sourceType !== 'ALL' ? { source_type: sourceType } : {};
  const response = await apiClient.get<DocumentListResponse>('/api/documents', { params });
  return response.data.documents;
};

export const fetchDocumentById = async (id: string): Promise<DocumentItem> => {
  const response = await apiClient.get<DocumentItem>(`/api/documents/${id}`);
  return response.data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/documents/${id}`);
};

export const uploadPdfDocument = async (file: File): Promise<DocumentItem> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<DocumentItem>('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const ingestTextDocument = async (title: string, content: string): Promise<DocumentItem> => {
  const response = await apiClient.post<DocumentItem>('/api/documents/text', {
    title,
    content,
  });
  return response.data;
};

export const ingestWebDocument = async (url: string, title?: string): Promise<DocumentItem> => {
  const response = await apiClient.post<DocumentItem>('/api/documents/web', {
    url,
    title,
  });
  return response.data;
};

export const ingestYouTubeDocument = async (url: string, title?: string): Promise<DocumentItem> => {
  const response = await apiClient.post<DocumentItem>('/api/documents/youtube', {
    url,
    title,
  });
  return response.data;
};

export const ingestGitRepository = async (
  repoUrl: string,
  branch?: string,
  fileExtensions?: string[],
  accessToken?: string,
  name?: string
): Promise<DocumentItem> => {
  const response = await apiClient.post<DocumentItem>('/api/documents/git', {
    repo_url: repoUrl,
    branch: branch || undefined,
    file_extensions: fileExtensions && fileExtensions.length > 0 ? fileExtensions : undefined,
    access_token: accessToken || undefined,
    name: name || undefined,
  });
  return response.data;
};
