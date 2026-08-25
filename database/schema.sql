CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator',
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  language_detected TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE land_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  landowner_name TEXT,
  survey_number TEXT,
  khasra_number TEXT,
  khata_number TEXT,
  plot_area NUMERIC,
  village TEXT,
  tehsil TEXT,
  district TEXT,
  land_classification TEXT,
  ownership_type TEXT,
  mutation_status TEXT,
  registration_number TEXT,
  geometry GEOMETRY(Polygon, 4326),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE field_confidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  land_record_id UUID REFERENCES land_records(id),
  field_name TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id)
);

CREATE TABLE duplicate_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  land_record_id UUID REFERENCES land_records(id),
  matched_record_id UUID REFERENCES land_records(id),
  similarity_score NUMERIC NOT NULL
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES users(id),
  old_value JSONB,
  new_value JSONB,
  performed_at TIMESTAMPTZ DEFAULT now()
);