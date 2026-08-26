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

export default router;