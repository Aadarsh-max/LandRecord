import { Router } from "express";
import axios from "axios";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

router.post("/verify", requireAuth, async (req, res) => {
  try {
    const { owner_name, survey_number } = req.body;
    const response = await axios.post(`${ML_SERVICE_URL}/ekyc/verify`, { owner_name, survey_number }, { timeout: 15000 });
    return res.json(response.data);
  } catch (error) {
    console.error("e-KYC verification failed:", error.message);
    return res.status(503).json({
      identity_lookup: { found: false },
      ownership_consistency: { status: "unavailable" },
      message: "e-KYC service unavailable"
    });
  }
});

export default router;