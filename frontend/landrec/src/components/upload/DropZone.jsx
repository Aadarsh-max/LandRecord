import { useState, useRef } from "react";
import { UploadCloud, FileText } from "lucide-react";

export default function DropZone({ onFileSelect, selectedFile }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) onFileSelect(file);
  }

  return (
    <div
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-clay border-2 border-dashed p-12 text-center transition-all duration-300 ${
        isDragging ? "border-blue-500 bg-blue-500/5" : "border-ink-muted/30 bg-base-surfaceLight"
      } shadow-clayInset hover:border-blue-400`}
    >
      <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />

      {selectedFile ? (
        <>
          <FileText className="mb-3 h-10 w-10 text-blue-600" />
          <p className="font-medium text-ink-primary">{selectedFile.name}</p>
          <p className="mt-1 text-sm text-ink-secondary">Click to choose a different file</p>
        </>
      ) : (
        <>
          <UploadCloud className="mb-3 h-10 w-10 text-ink-muted" />
          <p className="font-medium text-ink-primary">Drag and drop a scanned document</p>
          <p className="mt-1 text-sm text-ink-secondary">or click to browse — JPG, PNG, or PDF</p>
        </>
      )}
    </div>
  );
}