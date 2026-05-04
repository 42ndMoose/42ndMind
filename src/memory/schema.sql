-- Future SQLite schema. v0.1 uses JSON storage to avoid setup friction.

CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  source TEXT NOT NULL,
  subject TEXT,
  predicate TEXT,
  confidence REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contradictions (
  id TEXT PRIMARY KEY,
  claim_a TEXT NOT NULL,
  claim_b TEXT NOT NULL,
  description TEXT NOT NULL,
  severity REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hypotheses (
  id TEXT PRIMARY KEY,
  related_claim TEXT NOT NULL,
  text TEXT NOT NULL,
  confidence REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiry_tasks (
  id TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  question TEXT NOT NULL,
  priority REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS belief_updates (
  id TEXT PRIMARY KEY,
  before_state TEXT NOT NULL,
  after_state TEXT NOT NULL,
  reason TEXT NOT NULL,
  epistemic_delta TEXT NOT NULL,
  created_at TEXT NOT NULL
);
