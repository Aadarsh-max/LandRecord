import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { extractDocument } from "../services/mlService.js";
import { createDocument, updateDocumentStatus, listDocuments, getDocumentById } from "../models/Document.js";
import { createLandRecord, saveFieldConfidence, saveDuplicateFlags, getLandRecordById } from "../models/LandRecord.js";
import { createBatch, updateBatchProgress, completeBatch, getBatchById, getBatchDocuments } from "../models/Batch.js";
import { sendNotification, buildDigitizationMessage, buildVerificationMessage } from "../services/notificationService.js";
import { uploadDocumentFile, getDocumentFileUrl } from "../services/storageService.js";
import { logAction, getAuditLogsForEntity } from "../models/AuditLog.js";
import { pool } from "../config/db.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const mode = req.body.mode || "auto";
  let document;

  try {
    const objectKey = await uploadDocumentFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    document = await createDocument({
      filename: req.file.originalname,
      storagePath: objectKey,
      uploadedBy: req.auth.userId,
      languageDetected: null
    });

    const extraction = await extractDocument(req.file.buffer, req.file.originalname, mode, req.body.language);
    const result = extraction.result;

    const landRecord = await createLandRecord(document.id, result.structured_fields);
    await saveFieldConfidence(landRecord.id, result.structured_fields);

    if (result.validation_summary.duplicate_matches.length > 0) {
      await saveDuplicateFlags(landRecord.id, result.validation_summary.duplicate_matches);
    }

    const finalStatus = result.validation_summary.needs_human_review ? "pending" : "verified";
    await updateDocumentStatus(document.id, finalStatus);

    await logAction("document", document.id, "uploaded_and_processed", req.auth.userId, null, {
      filename: req.file.originalname,
      status: finalStatus,
      confidence: result.ocr_confidence
    });

    const landownerEmail = req.body.landowner_email || null;
    if (landownerEmail) {
      const { subject, body } = buildDigitizationMessage(landRecord.landowner_name, landRecord.survey_number);
      await sendNotification(landownerEmail, subject, body);
    }

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

router.get("/:id/file-url", requireAuth, async (req, res) => {
  const document = await getDocumentById(req.params.id);
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }
  try {
    const url = await getDocumentFileUrl(document.storage_path);
    return res.json({ url });
  } catch (error) {
    console.error("File URL generation failed:", error.message);
    return res.status(503).json({ message: "Could not generate file URL" });
  }
});

router.get("/:id/audit-log", requireAuth, async (req, res) => {
  const logs = await getAuditLogsForEntity("document", req.params.id);
  return res.json({ logs });
});

router.post("/:id/mark-verified", requireAuth, requireRole("verifier", "admin"), async (req, res) => {
  const updated = await updateDocumentStatus(req.params.id, "verified");
  if (!updated) {
    return res.status(404).json({ message: "Document not found" });
  }

  await logAction("document", req.params.id, "marked_verified", req.auth.userId, { status: "pending" }, { status: "verified" });

  const record = await getLandRecordById(req.params.id);
  if (record?.landowner_email) {
    const { subject, body } = buildVerificationMessage(record.landowner_name, record.survey_number);
    await sendNotification(record.landowner_email, subject, body);
  }

  return res.json({ document: updated });
});

router.post("/upload-batch", requireAuth, upload.array("files", 50), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  const mode = req.body.mode || "auto";
  const language = req.body.language;

  const batch = await createBatch(req.auth.userId, req.files.length);

  res.status(202).json({ batch_id: batch.id, total_files: batch.total_files, message: "Batch processing started" });

  let succeeded = 0;
  let failed = 0;
  let flagged = 0;
  let processed = 0;

  for (const file of req.files) {
    let document;
    try {
      const objectKey = await uploadDocumentFile(file.buffer, file.originalname, file.mimetype);

      document = await createDocument({
        filename: file.originalname,
        storagePath: objectKey,
        uploadedBy: req.auth.userId,
        languageDetected: null
      });
      await pool.query(`UPDATE documents SET batch_id = $1 WHERE id = $2`, [batch.id, document.id]);

      const extraction = await extractDocument(file.buffer, file.originalname, mode, language);
      const result = extraction.result;

      const landRecord = await createLandRecord(document.id, result.structured_fields);
      await saveFieldConfidence(landRecord.id, result.structured_fields);

      if (result.validation_summary.duplicate_matches.length > 0) {
        await saveDuplicateFlags(landRecord.id, result.validation_summary.duplicate_matches);
      }

      const finalStatus = result.validation_summary.needs_human_review ? "pending" : "verified";
      await updateDocumentStatus(document.id, finalStatus);
      await logAction("document", document.id, "uploaded_and_processed", req.auth.userId, null, {
        filename: file.originalname,
        status: finalStatus,
        batch_id: batch.id
      });

      if (finalStatus === "pending") {
        flagged += 1;
      }
      succeeded += 1;
    } catch (error) {
      console.error(`Batch item failed (${file.originalname}):`, error.message);
      if (document) {
        await updateDocumentStatus(document.id, "failed");
      }
      failed += 1;
    }

    processed += 1;
    await updateBatchProgress(batch.id, processed, succeeded, failed, flagged);
  }

  await completeBatch(batch.id);
});

router.get("/batch/:batchId", requireAuth, async (req, res) => {
  const batch = await getBatchById(req.params.batchId);
  if (!batch) {
    return res.status(404).json({ message: "Batch not found" });
  }
  const documents = await getBatchDocuments(req.params.batchId);
  return res.json({ batch, documents });
});

export default router;