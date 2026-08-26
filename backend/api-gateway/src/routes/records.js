import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { getLandRecordById, listLandRecords, verifyField } from "../models/LandRecord.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const records = await listLandRecords();
  return res.json({ records });
});

router.get("/:id", requireAuth, async (req, res) => {
  const record = await getLandRecordById(req.params.id);
  if (!record) {
    return res.status(404).json({ message: "Record not found" });
  }
  return res.json({ record });
});

router.post("/:id/verify", requireAuth, requireRole("verifier", "admin"), async (req, res) => {
  const { fieldName, correctedValue } = req.body;

  if (!fieldName) {
    return res.status(400).json({ message: "fieldName is required" });
  }

  await verifyField(req.params.id, fieldName, req.auth.userId, correctedValue);
  const updatedRecord = await getLandRecordById(req.params.id);

  return res.json({ record: updatedRecord });
});

export default router;