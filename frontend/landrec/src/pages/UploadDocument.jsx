import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanLine, Sparkles, ShieldCheck, MapPin } from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import DropZone from "../components/upload/DropZone";
import Button from "../components/common/Button";
import { useUpload } from "../hooks/useUpload";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "marathi", label: "Marathi" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "bengali", label: "Bengali" },
  { value: "gujarati", label: "Gujarati" },
  { value: "kannada", label: "Kannada" },
  { value: "malayalam", label: "Malayalam" },
  { value: "odia", label: "Odia" },
  { value: "punjabi", label: "Punjabi" },
  { value: "urdu", label: "Urdu" }
];

const STEPS = [
  { icon: ScanLine, title: "Image Enhancement", desc: "Lighting, noise and sharpness are corrected automatically." },
  { icon: Sparkles, title: "AI Extraction", desc: "Sarvam AI reads the document and extracts all 12 required fields." },
  { icon: ShieldCheck, title: "Validation", desc: "Business rules, duplicates and e-KYC ownership checks run automatically." },
  { icon: MapPin, title: "GIS Mapping", desc: "The parcel location is geocoded and plotted on a live map." }
];

export default function UploadDocument() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [language, setLanguage] = useState("en");
  const { uploadDocument, uploading, error, result } = useUpload();
  const navigate = useNavigate();

  async function handleUpload() {
    if (!selectedFile) return;
    try {
      const response = await uploadDocument(selectedFile, "auto", language);
      setTimeout(() => navigate("/verification", { state: { recordId: response.land_record.id } }), 1200);
    } catch {
      // error already captured in hook state
    }
  }

  return (
    <div className="flex min-h-screen bg-base-bg pb-24 md:pb-0">
      <Sidebar />

      <div className="flex-1 px-5 py-8 sm:px-10">
        <h1 className="text-2xl font-semibold text-ink-primary">Upload a land record</h1>
        <p className="mt-1 text-sm text-ink-secondary">Scanned images or PDFs are supported, in any Indian language</p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label htmlFor="language" className="mb-2 block text-sm font-medium text-ink-secondary">
              Document language
            </label>
            <select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="mb-6 w-full rounded-claySm bg-base-surface px-4 py-3 text-sm text-ink-primary shadow-clayInset focus:outline-none"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

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

          <div className="rounded-clay bg-base-surfaceLight p-6 shadow-clay">
            <p className="mb-5 text-sm font-semibold text-ink-primary">How it works</p>
            <div className="space-y-5">
              {STEPS.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-500 text-white shadow-clay">
                      <Icon className="h-4 w-4" />
                    </div>
                    {i < STEPS.length - 1 && <div className="mt-1 h-8 w-px bg-ink-muted/20" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-primary">{title}</p>
                    <p className="mt-0.5 text-xs text-ink-secondary">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}