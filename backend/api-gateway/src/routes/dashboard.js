import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { pool } from "../config/db.js";
import { getCorrectionPatterns, getWorstPerformingFields } from "../models/CorrectionAnalytics.js";

const router = Router();

router.get("/stats", requireAuth, async (req, res) => {
  const totalDocs = await pool.query(`SELECT COUNT(*) FROM documents`);
  const verifiedDocs = await pool.query(`SELECT COUNT(*) FROM documents WHERE status = 'verified'`);
  const pendingDocs = await pool.query(`SELECT COUNT(*) FROM documents WHERE status = 'pending'`);
  const failedDocs = await pool.query(`SELECT COUNT(*) FROM documents WHERE status = 'failed'`);
  const flaggedRecords = await pool.query(`SELECT COUNT(DISTINCT land_record_id) FROM duplicate_flags`);

  return res.json({
    total_documents: parseInt(totalDocs.rows[0].count, 10),
    verified_records: parseInt(verifiedDocs.rows[0].count, 10),
    pending_verification: parseInt(pendingDocs.rows[0].count, 10),
    failed_documents: parseInt(failedDocs.rows[0].count, 10),
    flagged_for_review: parseInt(flaggedRecords.rows[0].count, 10)
  });
});

router.get("/breakdown", requireAuth, async (req, res) => {
  const byDistrict = await pool.query(
    `SELECT district, COUNT(*) as count FROM land_records
     WHERE district IS NOT NULL GROUP BY district ORDER BY count DESC LIMIT 8`
  );

  const byClassification = await pool.query(
    `SELECT land_classification, COUNT(*) as count FROM land_records
     WHERE land_classification IS NOT NULL GROUP BY land_classification`
  );

  const byStatus = await pool.query(
    `SELECT status, COUNT(*) as count FROM documents GROUP BY status`
  );

  return res.json({
    by_district: byDistrict.rows.map((r) => ({ name: r.district, count: parseInt(r.count, 10) })),
    by_classification: byClassification.rows.map((r) => ({ name: r.land_classification, count: parseInt(r.count, 10) })),
    by_status: byStatus.rows.map((r) => ({ name: r.status, count: parseInt(r.count, 10) }))
  });
});

router.get("/error-stats", requireAuth, async (req, res) => {
  const failedDocs = await pool.query(
    `SELECT COUNT(*) as count FROM documents WHERE status = 'failed'`
  );

  const lowConfidenceFields = await pool.query(
    `SELECT field_name, COUNT(*) as count FROM field_confidence
     WHERE confidence_score < 0.5 GROUP BY field_name ORDER BY count DESC LIMIT 10`
  );

  const duplicateFlags = await pool.query(
    `SELECT COUNT(*) as count FROM duplicate_flags`
  );

  const totalFields = await pool.query(`SELECT COUNT(*) as count FROM field_confidence`);
  const avgConfidence = await pool.query(`SELECT AVG(confidence_score) as avg FROM field_confidence`);

  return res.json({
    failed_documents: parseInt(failedDocs.rows[0].count, 10),
    duplicate_flags_raised: parseInt(duplicateFlags.rows[0].count, 10),
    total_fields_extracted: parseInt(totalFields.rows[0].count, 10),
    average_field_confidence: avgConfidence.rows[0].avg ? parseFloat(avgConfidence.rows[0].avg).toFixed(2) : null,
    most_error_prone_fields: lowConfidenceFields.rows.map((r) => ({
      field_name: r.field_name,
      low_confidence_count: parseInt(r.count, 10)
    }))
  });
});

router.get("/recent", requireAuth, async (req, res) => {
  const recent = await pool.query(
    `SELECT d.id, d.filename, d.status, d.uploaded_at, lr.landowner_name, lr.survey_number, lr.village
     FROM documents d
     LEFT JOIN land_records lr ON lr.document_id = d.id
     ORDER BY d.uploaded_at DESC LIMIT 8`
  );

  return res.json({ recent: recent.rows });
});

router.get("/learning-insights", requireAuth, async (req, res) => {
  const correctionPatterns = await getCorrectionPatterns();
  const worstFields = await getWorstPerformingFields();

  const recommendations = worstFields
    .filter((f) => parseFloat(f.avg_confidence) < 0.6)
    .map((f) => ({
      field: f.field_name,
      issue: `Average confidence is ${Math.round(parseFloat(f.avg_confidence) * 100)}%, below the 60% reliability threshold.`,
      suggestion: `Consider refining the extraction schema description for "${f.field_name}" or reviewing common failure patterns for this field.`
    }));

  return res.json({
    correction_patterns: correctionPatterns,
    worst_performing_fields: worstFields,
    recommendations,
    note: "This view surfaces patterns in verifier corrections and field confidence, forming the foundation for AI-driven improvement. Automated schema/prompt refinement based on this data is a planned next step."
  });
});

export default router;