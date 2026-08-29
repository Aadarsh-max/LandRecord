import { Router } from "express";
import axios from "axios";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

router.post("/marker", requireAuth, async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/gis/marker`, req.body, { timeout: 15000 });
    return res.json(response.data);
  } catch (error) {
    console.error("GIS marker request failed:", error.message);
    return res.status(503).json({ available: false, message: "GIS service unavailable" });
  }
});

export default router;