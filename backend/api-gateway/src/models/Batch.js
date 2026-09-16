import { pool } from "../config/db.js";

export async function createBatch(uploadedBy, totalFiles) {
  const result = await pool.query(
    `INSERT INTO upload_batches (uploaded_by, total_files, status)
     VALUES ($1, $2, 'processing') RETURNING *`,
    [uploadedBy, totalFiles]
  );
  return result.rows[0];
}

export async function updateBatchProgress(batchId, processedCount, succeededCount, failedCount, flaggedCount) {
  const result = await pool.query(
    `UPDATE upload_batches
     SET processed_files = $1, succeeded_files = $2, failed_files = $3, flagged_files = $4
     WHERE id = $5 RETURNING *`,
    [processedCount, succeededCount, failedCount, flaggedCount, batchId]
  );
  return result.rows[0];
}

export async function completeBatch(batchId) {
  const result = await pool.query(
    `UPDATE upload_batches SET status = 'completed', completed_at = now() WHERE id = $1 RETURNING *`,
    [batchId]
  );
  return result.rows[0];
}

export async function getBatchById(batchId) {
  const result = await pool.query(`SELECT * FROM upload_batches WHERE id = $1`, [batchId]);
  return result.rows[0];
}

export async function getBatchDocuments(batchId) {
  const result = await pool.query(
    `SELECT d.*, lr.landowner_name, lr.survey_number FROM documents d
     LEFT JOIN land_records lr ON lr.document_id = d.id
     WHERE d.batch_id = $1 ORDER BY d.uploaded_at`,
    [batchId]
  );
  return result.rows;
}