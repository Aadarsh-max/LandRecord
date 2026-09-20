import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

const router = Router();

const ALLOWED_SIGNUP_ROLES = ["operator", "verifier", "admin"];

router.post("/signup", async (req, res) => {
  const { name, email, password, department, role } = req.body;

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount > 0) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const finalRole = ALLOWED_SIGNUP_ROLES.includes(role) ? role : "operator";

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, department, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, department`,
    [name, email, passwordHash, department, finalRole]
  );

  return res.status(201).json({ user: result.rows[0] });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

export default router;