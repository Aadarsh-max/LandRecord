import dotenv from "dotenv";
import fs from "fs";

const envPath = "../../.env";
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}