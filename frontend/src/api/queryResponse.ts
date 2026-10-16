import { apiClient } from './apiClient';

export interface Citation {
  id: string;
  chunk_index: number;
  content: string;
  similarity: number;
  file_path?: string | null;
  page_number?: number | null;
  line_start?: number | null;
  line_end?: number | null;
  url?: string | null;
  language?: string | null;
}

export interface QueryResponse {
  document_id: string;
  query: string;
  answer: string;
  abstained: boolean;
  abstention_reason?: string | null;
  citations: Citation[];
  latency_ms: number;
}

export const queryKnowledge = async (
  documentId: string,
  query: string,
  topK: number = 5
): Promise<QueryResponse> => {
  const response = await apiClient.post<QueryResponse>('/api/query', {
    document_id: documentId,
    query,
    top_k: topK,
  });
  return response.data;
};
