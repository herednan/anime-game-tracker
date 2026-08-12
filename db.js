import { DatabaseSync } from "node:sqlite"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { mkdirSync } from "node:fs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, "data")
mkdirSync(dataDir, { recursive: true })

const db = new DatabaseSync(join(dataDir, "collection.db"))

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    rating INTEGER,
    season INTEGER,
    episode INTEGER,
    progress INTEGER,
    added_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_items_user ON items(user_id, type);
`)

export { db }
