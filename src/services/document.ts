import api from "./api";

// Request interface for updating document
interface DocumentUpdateRequest {
  title: string;
  description?: string;
  tags?: string[];
  is_searchable?: boolean;
}

// Response interface for document
export interface DocumentResponse {
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

export interface ShowDocumentResponse {
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
  permissions?: Array<string>;
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
export interface StorageUsageResponse {
  free_space: string;
  used_space: string;
  total_space: string;
  used_space_documents: string;
  storage_by_type: {
    pdf: string;
    image: string;
    doc: string;
    excel: string;
    other: string;
  };
  file_counts: {
    pdf: number;
    image: number;
    doc: number;
    excel: number;
    other: number;
  };
  total_documents: number;
  file_type_stats: {
    pdf: number;
    image: number;
    doc: number;
    excel: number;
    other: number;
  };
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
  const response = await api.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getDocument(
  documentId: string
): Promise<ShowDocumentResponse> {
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

export async function displayDocument(documentId: string): Promise<string> {
  const response = await api.get(`/documents/${documentId}/display`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], {
    type: response.headers["content-type"],
  });
  return URL.createObjectURL(blob);
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

export async function downloadDocument(documentId: string): Promise<void> {
  try {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      response.headers["content-disposition"]?.match(/filename="(.+)"/)?.[1] ||
      `document-${documentId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error("Failed to download document");
  }
}

export async function changeDocumentBinder(
  documentId: string,
  binderId: string
): Promise<DocumentResponse> {
  const response = await api.put(`/documents/${documentId}/change-binder`, {
    binder_id: binderId,
  });
  return response.data;
}
