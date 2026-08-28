import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { pool } from "../config/db.js";

const router = Router();

router.get("/stats", requireAuth, async (req, res) => {
  const totalDocs = await pool.query(`SELECT COUNT(*) FROM documents`);
  const verifiedDocs = await pool.query(`SELECT COUNT(*) FROM documents WHERE status = 'verified'`);
  const pendingDocs = await pool.query(`SELECT COUNT(*) FROM documents WHERE status = 'pending'`);
  const flaggedRecords = await pool.query(`SELECT COUNT(DISTINCT land_record_id) FROM duplicate_flags`);

  return res.json({
    total_documents: parseInt(totalDocs.rows[0].count, 10),
    verified_records: parseInt(verifiedDocs.rows[0].count, 10),
    pending_verification: parseInt(pendingDocs.rows[0].count, 10),
    flagged_for_review: parseInt(flaggedRecords.rows[0].count, 10)
  });
});

router.get("/breakdown", requireAuth, async (req, res) => {
  const byDistrict = await pool.query(
    `SELECT district, COUNT(*) as count FROM land_records
     WHERE district IS NOT NULL GROUP BY district ORDER BY count DESC LIMIT 6`
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

router.get("/recent", requireAuth, async (req, res) => {
  const recent = await pool.query(
    `SELECT d.id, d.filename, d.status, d.uploaded_at, lr.landowner_name, lr.survey_number, lr.village
     FROM documents d
     LEFT JOIN land_records lr ON lr.document_id = d.id
     ORDER BY d.uploaded_at DESC LIMIT 8`
  );

  return res.json({ recent: recent.rows });
});

export default router;