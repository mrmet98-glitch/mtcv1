CREATE TABLE IF NOT EXISTS consultation_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'new',
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  monthly_trips TEXT NOT NULL,
  monthly_passengers TEXT NOT NULL,
  annual_travel_spend TEXT NOT NULL,
  primary_travel TEXT,
  business_programs TEXT NOT NULL,
  business_program_airlines TEXT,
  booking_method TEXT NOT NULL,
  travel_card TEXT NOT NULL,
  primary_airlines TEXT,
  goals TEXT,
  notes TEXT,
  requested_tier TEXT,
  consent TEXT NOT NULL DEFAULT 'Yes',
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_consultation_created_at
  ON consultation_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultation_status
  ON consultation_requests(status);
