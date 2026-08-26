import { Router } from "express";
import axios from "axios";
import { requireAuth } from "../middlewares/auth.js";
import { listLandRecords } from "../models/LandRecord.js";

const router = Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

router.post("/reindex", requireAuth, async (req, res) => {
  const records = await listLandRecords(500);
  const payload = {
    records: records.map((r) => ({
      id: r.id,
      landowner_name: r.landowner_name,
      survey_number: r.survey_number,
      village: r.village,
      tehsil: r.tehsil,
      district: r.district,
      land_classification: r.land_classification,
      ownership_type: r.ownership_type,
      plot_area: r.plot_area ? parseFloat(r.plot_area) : null
    }))
  };

  const response = await axios.post(`${ML_SERVICE_URL}/search/index`, payload);
  return res.json(response.data);
});

router.post("/query", requireAuth, async (req, res) => {
  const { query, top_k } = req.body;
  const response = await axios.post(`${ML_SERVICE_URL}/search/query`, { query, top_k: top_k || 5 });

  const matchIds = response.data.matches.map((m) => m.id);
  const allRecords = await listLandRecords(500);
  const enrichedMatches = response.data.matches.map((match) => {
    const record = allRecords.find((r) => r.id === match.id);
    return { ...match, record };
  });

  return res.json({ matches: enrichedMatches, filters_detected: response.data.filters_detected });
});

export default router;