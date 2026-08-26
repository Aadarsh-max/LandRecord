import "./env.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/documents.js";
import recordRoutes from "./routes/records.js";
import dashboardRoutes from "./routes/dashboard.js";
import searchRoutes from "./routes/search.js";
import riskRoutes from "./routes/risk.js";
import gisRoutes from "./routes/gis.js";
import integrationRoutes from "./routes/integrations.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/gis", gisRoutes);
app.use("/api/integrations", integrationRoutes);

const port = process.env.API_PORT || 4000;

app.listen(port, () => {
  console.log(`api-gateway running on port ${port}`);
});