CREATE TABLE IF NOT EXISTS note (
  data BLOB,
  ispassword INTEGER,
  created INTEGER,
  isblob INTEGER,
  title TEXT
);

CREATE TABLE IF NOT EXISTS tag(
  name TEXT
);
CREATE TABLE IF NOT EXISTS note_tag(
  note_id INTEGER,
  tag_id INTEGER
);
CREATE TABLE IF NOT EXISTS config(
  config TEXT
);

INSERT INTO config (config) VALUES ('{"version":0}');
