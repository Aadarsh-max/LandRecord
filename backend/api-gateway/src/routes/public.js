import { Router } from "express";
import { pool } from "../config/db.js";

const router = Router();

router.get("/records/lookup", async (req, res) => {
  const { survey_number, village } = req.query;

  if (!survey_number) {
    return res.status(400).json({ message: "survey_number is required" });
  }

  const result = await pool.query(
    `SELECT landowner_name, survey_number, village, tehsil, district,
            land_classification, mutation_status, created_at
     FROM land_records
     WHERE survey_number = $1 ${village ? "AND village ILIKE $2" : ""}
     LIMIT 5`,
    village ? [survey_number, village] : [survey_number]
  );

  if (result.rows.length === 0) {
    return res.json({ found: false, records: [] });
  }

  return res.json({ found: true, records: result.rows });
});

router.post("/feedback", async (req, res) => {
  const { survey_number, name, contact, message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Feedback message is required" });
  }

  await pool.query(
    `INSERT INTO citizen_feedback (survey_number, submitter_name, submitter_contact, message)
     VALUES ($1, $2, $3, $4)`,
    [survey_number || null, name || null, contact || null, message]
  );

  return res.status(201).json({ status: "received" });
});

export default router;