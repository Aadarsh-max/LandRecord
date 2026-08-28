import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { extractDocument } from "../services/mlService.js";
import { createDocument, updateDocumentStatus, listDocuments, getDocumentById } from "../models/Document.js";
import { createLandRecord, saveFieldConfidence, saveDuplicateFlags } from "../models/LandRecord.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const mode = req.body.mode || "auto";
  let document;

  try {
    document = await createDocument({
      filename: req.file.originalname,
      storagePath: `pending-storage/${req.file.originalname}`,
      uploadedBy: req.auth.userId,
      languageDetected: null
    });

    const extraction = await extractDocument(req.file.buffer, req.file.originalname, mode);
    const result = extraction.result;

    const landRecord = await createLandRecord(document.id, result.structured_fields);
    await saveFieldConfidence(landRecord.id, result.structured_fields);

    if (result.validation_summary.duplicate_matches.length > 0) {
      await saveDuplicateFlags(landRecord.id, result.validation_summary.duplicate_matches);
    }

    const finalStatus = result.validation_summary.needs_human_review ? "pending" : "verified";
    await updateDocumentStatus(document.id, finalStatus);

    return res.status(201).json({
      document: { ...document, status: finalStatus },
      land_record: landRecord,
      validation_summary: result.validation_summary,
      ocr_confidence: result.ocr_confidence
    });
  } catch (error) {
    console.error("Document processing failed:", error.message);
    if (document) {
      await updateDocumentStatus(document.id, "failed");
    }
    return res.status(500).json({ message: "Document processing failed", error: error.message });
  }
});

router.get("/", requireAuth, async (req, res) => {
  const documents = await listDocuments();
  return res.json({ documents });
});

router.get("/:id", requireAuth, async (req, res) => {
  const document = await getDocumentById(req.params.id);
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }
  return res.json({ document });
});

router.post("/:id/mark-verified", requireAuth, requireRole("verifier", "admin"), async (req, res) => {
  const updated = await updateDocumentStatus(req.params.id, "verified");
  if (!updated) {
    return res.status(404).json({ message: "Document not found" });
  }
  return res.json({ document: updated });
});

export default router;