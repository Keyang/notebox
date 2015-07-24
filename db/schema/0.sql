CREATE TABLE IF NOT EXISTS note (
  rowid INTEGER PRIMARY KEY,
  data BLOB,
  ispassword INTEGER,
  created INTEGER,
  isblob INTEGER,
  title TEXT
);

CREATE TABLE IF NOT EXISTS tag(
  rowid INTEGER PRIMARY KEY,
  name TEXT
);
CREATE TABLE IF NOT EXISTS note_tag(
  note_id INTEGER,
  tag_id INTEGER
);
CREATE TABLE IF NOT EXISTS config(
  rowid INTEGER PRIMARY KEY,
  config TEXT
);

INSERT INTO config (config) VALUES ('{"version":0}');
