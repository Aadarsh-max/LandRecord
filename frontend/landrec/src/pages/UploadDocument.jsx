import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import DropZone from "../components/upload/DropZone";
import Button from "../components/common/Button";
import { useUpload } from "../hooks/useUpload";

export default function UploadDocument() {
  const [selectedFile, setSelectedFile] = useState(null);
  const { uploadDocument, uploading, error, result } = useUpload();
  const navigate = useNavigate();

  async function handleUpload() {
    if (!selectedFile) return;
    try {
      const response = await uploadDocument(selectedFile);
      setTimeout(() => navigate("/verification", { state: { recordId: response.land_record.id } }), 1200);
    } catch {
      // error already captured in hook state
    }
  }

  return (
    <div className="flex min-h-screen bg-base-bg">
      <Sidebar />

      <div className="flex-1 px-10 py-10">
        <h1 className="text-2xl font-semibold text-ink-primary">Upload a land record</h1>
        <p className="mt-1 text-sm text-ink-secondary">Scanned images or PDFs are supported</p>

        <div className="mt-8 max-w-2xl">
          <DropZone onFileSelect={setSelectedFile} selectedFile={selectedFile} />

          {error && (
            <p className="mt-4 rounded-claySm bg-red-500/10 p-3 text-sm text-red-500">{error}</p>
          )}

          {result && (
            <div className="mt-4 rounded-claySm bg-green-500/10 p-4 text-sm text-green-600">
              Document processed successfully. Overall confidence:{" "}
              {Math.round(result.validation_summary.overall_confidence * 100)}%. Redirecting to verification...
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="mt-6"
          >
            {uploading ? "Processing document..." : "Upload and Extract"}
          </Button>
        </div>
      </div>
    </div>
  );
}