import { Router } from "express";
import axios from "axios";
import { requireAuth } from "../middlewares/auth.js";
import { pool } from "../config/db.js";

const router = Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

router.get("/:recordId", requireAuth, async (req, res) => {
  try {
    const recordResult = await pool.query(`SELECT * FROM land_records WHERE id = $1`, [req.params.recordId]);
    const record = recordResult.rows[0];
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    const duplicatesResult = await pool.query(
      `SELECT * FROM duplicate_flags WHERE land_record_id = $1`,
      [req.params.recordId]
    );

    const hasMissingFields = !record.landowner_name || !record.survey_number || !record.village || !record.district;

    const payload = {
      landowner_name: record.landowner_name,
      survey_number: record.survey_number,
      village: record.village,
      mutation_count: record.mutation_status ? 1 : 0,
      duplicate_match_count: duplicatesResult.rows.length,
      has_missing_fields: hasMissingFields
    };

    const response = await axios.post(`${ML_SERVICE_URL}/risk/score`, payload, { timeout: 15000 });
    return res.json(response.data);
  } catch (error) {
    console.error("Risk score request failed:", error.message);
    return res.status(503).json({ risk_score: 0, risk_level: "unknown", reasons: [], message: "Risk service unavailable" });
  }
});

export default router;