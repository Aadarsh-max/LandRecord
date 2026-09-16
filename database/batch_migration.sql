CREATE TABLE upload_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID REFERENCES users(id),
  total_files INTEGER NOT NULL,
  processed_files INTEGER DEFAULT 0,
  succeeded_files INTEGER DEFAULT 0,
  failed_files INTEGER DEFAULT 0,
  flagged_files INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE documents ADD COLUMN batch_id UUID REFERENCES upload_batches(id);