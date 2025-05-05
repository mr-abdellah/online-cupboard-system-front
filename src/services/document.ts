import api from "./api";

// Request interface for updating document
interface DocumentUpdateRequest {
  title: string;
  description?: string;
  tags?: string[];
  is_searchable?: boolean;
}

// Response interface for document
interface DocumentResponse {
  id: string;
  title: string;
  description: string | null;
  type: string;
  ocr: string | null;
  tags: string[];
  binder_id: string;
  path: string;
  order: number;
  is_searchable: boolean;
  created_at: string;
  updated_at: string;
  permissions?: Array<{
    document_id: string;
    user_id: string;
    permission: string;
  }>;
}

// Response interface for OCR extraction
interface OcrResponse {
  text: string;
}

// Response interface for file type stats
interface FileTypeStatsResponse {
  pdf: number;
  image: number;
  doc: number;
  video: number;
  other: number;
}

// Response interface for storage usage
interface StorageUsageResponse {
  used_space_documents: string; // e.g., "1.5 MB"
  storage_by_type: {
    pdf: string;
    image: string;
    doc: string;
    video: string;
    other: string;
  };
  file_counts: {
    pdf: number;
    image: number;
    doc: number;
    video: number;
    other: number;
  };
  total_documents: number;
}

export async function getDocuments(): Promise<DocumentResponse[]> {
  try {
    const response = await api.get("/documents");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch documents");
  }
}

export async function createDocument(
  formData: FormData
): Promise<DocumentResponse> {
  try {
    const response = await api.post("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to create document");
  }
}

export async function getDocument(
  documentId: string
): Promise<DocumentResponse> {
  try {
    const response = await api.get(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch document");
  }
}

export async function updateDocument(
  documentId: string,
  data: DocumentUpdateRequest
): Promise<DocumentResponse> {
  try {
    const response = await api.post(`/documents/${documentId}`, data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update document");
  }
}

export async function deleteDocument(documentId: string): Promise<void> {
  try {
    await api.delete(`/documents/${documentId}`);
  } catch (error) {
    throw new Error("Failed to delete document");
  }
}

export async function extractOcr(file: File): Promise<OcrResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/documents/extract-ocr", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to extract OCR");
  }
}

export async function displayDocument(documentId: string): Promise<Blob> {
  try {
    const response = await api.get(`/documents/${documentId}/display`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to display document");
  }
}

export async function searchDocuments(
  query: string
): Promise<DocumentResponse[]> {
  try {
    const response = await api.get(
      `/documents/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to search documents");
  }
}

export async function getFileTypeStats(): Promise<FileTypeStatsResponse> {
  try {
    const response = await api.get("/documents/file-type-stats");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch file type stats");
  }
}

export async function getStorageUsage(): Promise<StorageUsageResponse> {
  try {
    const response = await api.get("/documents/storage-usage");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch storage usage");
  }
}
