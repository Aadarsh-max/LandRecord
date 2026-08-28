import axios from "axios";
import FormData from "form-data";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export async function extractDocument(fileBuffer, filename, mode = "auto") {
  const form = new FormData();
  form.append("file", fileBuffer, filename);
  form.append("mode", mode);

  const response = await axios.post(`${ML_SERVICE_URL}/ocr/extract`, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 180000,
  });

  return response.data;
}
