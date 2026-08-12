import jwt from "jsonwebtoken"
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { existsSync, readFileSync, writeFileSync } from "node:fs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const secretPath = join(__dirname, ".secret")

function getSecret() {
  if (existsSync(secretPath)) {
    return readFileSync(secretPath, "utf8").trim()
  }
  const secret = randomBytes(32).toString("hex")
  writeFileSync(secretPath, secret, { mode: 0o600 })
  return secret
}

export const JWT_SECRET = getSecret()

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":")
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, "hex")
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: "30d" })
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = Number(payload.sub)
    next()
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" })
  }
}
