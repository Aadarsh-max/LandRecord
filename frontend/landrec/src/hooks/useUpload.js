import { useState } from "react";
import api from "../services/api";

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function uploadDocument(file, mode = "auto") {
    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    try {
      const response = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 200000
      });
      setResult(response.data);
      return response.data;
    } catch (uploadError) {
      const message = uploadError.response?.data?.message || "Upload failed";
      setError(message);
      throw uploadError;
    } finally {
      setUploading(false);
    }
  }

  return { uploadDocument, uploading, error, result };
}