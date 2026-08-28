import { pool } from "../config/db.js";

function extractNumericArea(rawValue) {
  if (!rawValue) return null;
  const match = String(rawValue).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

export async function createLandRecord(documentId, fields) {
  const result = await pool.query(
    `INSERT INTO land_records (
      document_id, landowner_name, survey_number, khasra_number, khata_number,
      plot_area, village, tehsil, district, land_classification,
      ownership_type, mutation_status, registration_number
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [
      documentId,
      fields.landowner_name?.value || null,
      fields.survey_number?.value || null,
      fields.khasra_number?.value || null,
      fields.khata_number?.value || null,
      extractNumericArea(fields.plot_area?.value),
      fields.village?.value || null,
      fields.tehsil?.value || null,
      fields.district?.value || null,
      fields.land_classification?.value || null,
      fields.ownership_type?.value || null,
      fields.mutation_status?.value || null,
      fields.registration_number?.value || null
    ]
  );
  return result.rows[0];
}

export async function saveFieldConfidence(landRecordId, structuredFields) {
  const entries = Object.entries(structuredFields);
  for (const [fieldName, fieldData] of entries) {
    if (fieldData.value === null) continue;
    await pool.query(
      `INSERT INTO field_confidence (land_record_id, field_name, confidence_score, is_verified)
       VALUES ($1, $2, $3, FALSE)`,
      [landRecordId, fieldName, fieldData.confidence]
    );
  }
}

export async function saveDuplicateFlags(landRecordId, duplicates) {
  for (const duplicate of duplicates) {
    await pool.query(
      `INSERT INTO duplicate_flags (land_record_id, matched_record_id, similarity_score)
       VALUES ($1, $2, $3)`,
      [landRecordId, duplicate.matched_record_id, duplicate.similarity_score]
    );
  }
}

export async function getLandRecordById(recordId) {
  const recordResult = await pool.query(
    `SELECT lr.*, d.status as document_status FROM land_records lr
     LEFT JOIN documents d ON d.id = lr.document_id
     WHERE lr.id = $1`,
    [recordId]
  );
  const record = recordResult.rows[0];
  if (!record) return null;

  const confidenceResult = await pool.query(
    `SELECT field_name, confidence_score, is_verified FROM field_confidence WHERE land_record_id = $1`,
    [recordId]
  );

  return { ...record, field_confidence: confidenceResult.rows };
}

export async function listLandRecords(limit = 50) {
  const result = await pool.query(
    `SELECT lr.*, d.status as document_status FROM land_records lr
     LEFT JOIN documents d ON d.id = lr.document_id
     ORDER BY lr.created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function verifyField(recordId, fieldName, verifiedBy, correctedValue) {
  await pool.query(
    `UPDATE field_confidence SET is_verified = TRUE, verified_by = $1
     WHERE land_record_id = $2 AND field_name = $3`,
    [verifiedBy, recordId, fieldName]
  );

  if (correctedValue !== undefined) {
    const columnMap = {
      landowner_name: "landowner_name",
      survey_number: "survey_number",
      khasra_number: "khasra_number",
      khata_number: "khata_number",
      plot_area: "plot_area",
      village: "village",
      tehsil: "tehsil",
      district: "district",
      land_classification: "land_classification",
      ownership_type: "ownership_type",
      mutation_status: "mutation_status",
      registration_number: "registration_number"
    };
    const column = columnMap[fieldName];
    if (column) {
      const finalValue = fieldName === "plot_area" ? extractNumericArea(correctedValue) : correctedValue;
      await pool.query(
        `UPDATE land_records SET ${column} = $1 WHERE id = $2`,
        [finalValue, recordId]
      );
    }
  }
}