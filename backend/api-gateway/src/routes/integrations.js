import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getLandRecordById, listLandRecords } from "../models/LandRecord.js";
import { pushToLRMS } from "../services/lrmsConnector.js";
import { formatForDILRMP } from "../services/dilrmpConnector.js";

const router = Router();

router.post("/lrms/push/:recordId", requireAuth, async (req, res) => {
  const record = await getLandRecordById(req.params.recordId);
  if (!record) return res.status(404).json({ message: "Record not found" });

  const result = await pushToLRMS(record);
  return res.json(result);
});

router.get("/dilrmp/export/:recordId", requireAuth, async (req, res) => {
  const record = await getLandRecordById(req.params.recordId);
  if (!record) return res.status(404).json({ message: "Record not found" });

  return res.json(formatForDILRMP(record));
});

router.get("/export/csv", requireAuth, async (req, res) => {
  const records = await listLandRecords(500);

  const headers = ["landowner_name", "survey_number", "khasra_number", "khata_number", "plot_area", "village", "tehsil", "district", "land_classification", "ownership_type", "mutation_status", "registration_number"];
  const rows = records.map((r) => headers.map((h) => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=land_records_export.csv");
  return res.send(csv);
});

export default router;