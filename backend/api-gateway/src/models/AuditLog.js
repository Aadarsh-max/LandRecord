import { pool } from "../config/db.js";

export async function logAction(entityType, entityId, action, performedBy, oldValue = null, newValue = null) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, old_value, new_value)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [entityType, entityId, action, performedBy, oldValue ? JSON.stringify(oldValue) : null, newValue ? JSON.stringify(newValue) : null]
    );
  } catch (error) {
    console.error("Audit log write failed:", error.message);
  }
}

export async function getAuditLogsForEntity(entityType, entityId, limit = 50) {
  const result = await pool.query(
    `SELECT al.*, u.name as performed_by_name FROM audit_logs al
     LEFT JOIN users u ON u.id = al.performed_by
     WHERE al.entity_type = $1 AND al.entity_id = $2
     ORDER BY al.performed_at DESC LIMIT $3`,
    [entityType, entityId, limit]
  );
  return result.rows;
}

export async function getRecentAuditLogs(limit = 100) {
  const result = await pool.query(
    `SELECT al.*, u.name as performed_by_name FROM audit_logs al
     LEFT JOIN users u ON u.id = al.performed_by
     ORDER BY al.performed_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}