import { Router } from "express";
import axios from "axios";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

router.post("/marker", requireAuth, async (req, res) => {
  const response = await axios.post(`${ML_SERVICE_URL}/gis/marker`, req.body);
  return res.json(response.data);
});

export default router;