import { pool } from "../config/db.js";

export async function createDocument({ filename, storagePath, uploadedBy, languageDetected }) {
  const result = await pool.query(
    `INSERT INTO documents (filename, storage_path, uploaded_by, status, language_detected)
     VALUES ($1, $2, $3, 'processing', $4) RETURNING *`,
    [filename, storagePath, uploadedBy, languageDetected]
  );
  return result.rows[0];
}

export async function updateDocumentStatus(documentId, status) {
  const result = await pool.query(
    `UPDATE documents SET status = $1 WHERE id = $2 RETURNING *`,
    [status, documentId]
  );
  return result.rows[0];
}

export async function listDocuments(limit = 50) {
  const result = await pool.query(
    `SELECT * FROM documents ORDER BY uploaded_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function getDocumentById(documentId) {
  const result = await pool.query(`SELECT * FROM documents WHERE id = $1`, [documentId]);
  return result.rows[0];
}