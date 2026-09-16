CREATE TABLE citizen_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_number TEXT,
  submitter_name TEXT,
  submitter_contact TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);