import { pool } from "../config/db.js";

export async function getCorrectionPatterns() {
  const result = await pool.query(`
    SELECT
      al.new_value->>'field' as field_name,
      COUNT(*) as correction_count
    FROM audit_logs al
    WHERE al.action = 'field_corrected'
    GROUP BY al.new_value->>'field'
    ORDER BY correction_count DESC
  `);
  return result.rows;
}

export async function getCorrectionsByLanguage() {
  const result = await pool.query(`
    SELECT
      d.language_detected,
      al.new_value->>'field' as field_name,
      COUNT(*) as correction_count
    FROM audit_logs al
    JOIN land_records lr ON lr.id = al.entity_id::uuid
    JOIN documents d ON d.id = lr.document_id
    WHERE al.action = 'field_corrected' AND al.entity_type = 'land_record'
    GROUP BY d.language_detected, al.new_value->>'field'
    ORDER BY correction_count DESC
    LIMIT 20
  `);
  return result.rows;
}

export async function getFieldAccuracyTrend(days = 30) {
  const result = await pool.query(`
    SELECT
      DATE(performed_at) as day,
      COUNT(*) as corrections
    FROM audit_logs
    WHERE action = 'field_corrected' AND performed_at > now() - interval '${days} days'
    GROUP BY DATE(performed_at)
    ORDER BY day
  `);
  return result.rows;
}

export async function getWorstPerformingFields(limit = 5) {
  const result = await pool.query(`
    SELECT
      field_name,
      COUNT(*) as total_extractions,
      SUM(CASE WHEN is_verified THEN 1 ELSE 0 END) as verified_count,
      AVG(confidence_score) as avg_confidence
    FROM field_confidence
    GROUP BY field_name
    HAVING COUNT(*) > 0
    ORDER BY avg_confidence ASC
    LIMIT $1
  `, [limit]);
  return result.rows;
}