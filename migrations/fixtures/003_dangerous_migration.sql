-- Deliberately unsafe fixture for a future safety-gate demonstration.
ALTER TABLE accounts ADD COLUMN tax_id TEXT NOT NULL;
DROP TABLE accounts;
