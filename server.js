import express from "express"
import os from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { db } from "./db.js"
import { hashPassword, verifyPassword, signToken, requireAuth } from "./auth.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(express.json())

app.post("/api/register", (req, res) => {
  const { username, password } = req.body || {}
  const name = String(username || "").trim()
  if (name.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" })
  }
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" })
  }
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(name)
  if (existing) {
    return res.status(409).json({ error: "Username already taken" })
  }
  const info = db
    .prepare("INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)")
    .run(name, hashPassword(password), Date.now())
  res.json({ token: signToken(info.lastInsertRowid), username: name })
})

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {}
  const name = String(username || "").trim()
  const row = db.prepare("SELECT * FROM users WHERE username = ?").get(name)
  if (!row || !verifyPassword(String(password || ""), row.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password" })
  }
  res.json({ token: signToken(row.id), username: row.username })
})

app.get("/api/me", requireAuth, (req, res) => {
  const row = db.prepare("SELECT username FROM users WHERE id = ?").get(req.userId)
  res.json({ username: row.username })
})

const cleanInt = (v) => (Number.isInteger(v) ? v : null)

app.get("/api/items", requireAuth, (req, res) => {
  const { type } = req.query
  const rows = type
    ? db
        .prepare("SELECT * FROM items WHERE user_id = ? AND type = ? ORDER BY added_at DESC")
        .all(req.userId, type)
    : db
        .prepare("SELECT * FROM items WHERE user_id = ? ORDER BY added_at DESC")
        .all(req.userId)
  res.json(rows.map(serialize))
})

app.post("/api/items", requireAuth, (req, res) => {
  const { type, title, status, rating, season, episode, progress } = req.body || {}
  const types = ["movies", "anime", "games"]
  if (!types.includes(type)) {
    return res.status(400).json({ error: "Invalid type" })
  }
  const name = String(title || "").trim()
  if (!name) {
    return res.status(400).json({ error: "Title is required" })
  }
  const info = db
    .prepare(
      `INSERT INTO items (user_id, type, title, status, rating, season, episode, progress, added_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.userId,
      type,
      name,
      String(status || "done"),
      cleanInt(rating),
      cleanInt(season),
      cleanInt(episode),
      cleanInt(progress),
      Date.now()
    )
  const row = db.prepare("SELECT * FROM items WHERE id = ?").get(info.lastInsertRowid)
  res.status(201).json(serialize(row))
})

app.put("/api/items/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const row = db.prepare("SELECT * FROM items WHERE id = ? AND user_id = ?").get(id, req.userId)
  if (!row) {
    return res.status(404).json({ error: "Item not found" })
  }
  const body = req.body || {}
  const numeric = ["rating", "season", "episode", "progress"]
  const updates = {}
  for (const field of ["title", "status", ...numeric]) {
    if (field in body) {
      updates[field] = numeric.includes(field) ? cleanInt(body[field]) : body[field]
    }
  }
  if ("title" in updates && !String(updates.title).trim()) {
    return res.status(400).json({ error: "Title is required" })
  }
  const keys = Object.keys(updates)
  if (keys.length) {
    const set = keys.map((k) => `${k} = ?`).join(", ")
    const values = keys.map((k) => (k === "title" ? String(updates[k]).trim() : updates[k]))
    db.prepare(`UPDATE items SET ${set} WHERE id = ?`).run(...values, id)
  }
  const updated = db.prepare("SELECT * FROM items WHERE id = ?").get(id)
  res.json(serialize(updated))
})

app.delete("/api/items/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const info = db.prepare("DELETE FROM items WHERE id = ? AND user_id = ?").run(id, req.userId)
  if (!info.changes) {
    return res.status(404).json({ error: "Item not found" })
  }
  res.json({ ok: true })
})

function serialize(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    status: row.status,
    rating: row.rating,
    season: row.season,
    episode: row.episode,
    progress: row.progress,
    addedAt: row.added_at,
  }
}

const dist = join(__dirname, "..", "dist")
app.use(express.static(dist))
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    return res.sendFile(join(dist, "index.html"))
  }
  next()
})

function lanAddresses() {
  const out = []
  for (const list of Object.values(os.networkInterfaces())) {
    for (const iface of list || []) {
      if (iface.family === "IPv4" && !iface.internal) out.push(iface.address)
    }
  }
  return out
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`)
  for (const ip of lanAddresses()) {
    console.log(`Share with friends on your network: http://${ip}:${PORT}`)
  }
})
