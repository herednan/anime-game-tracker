import { useState } from "react"
import { Clapperboard, Sparkles, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    if (mode === "register") {
      if (username.trim().length < 3) {
        setError("Username must be at least 3 characters")
        return
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        return
      }
      if (password !== confirm) {
        setError("Passwords do not match")
        return
      }
    }
    setBusy(true)
    try {
      const data = await api(`/api/${mode}`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })
      onAuth(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const icons = [Clapperboard, Sparkles, Gamepad2]

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-8">
      <div className="mb-6 flex items-center justify-center gap-3">
        {icons.map((Icon, i) => (
          <div
            key={i}
            className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <Icon className="size-4.5" />
          </div>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{mode === "login" ? "Welcome back" : "Create account"}</CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Log in to see your collection."
              : "Make an account to track your own movies, anime, and games."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </div>
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy
                ? "Please wait..."
                : mode === "login"
                  ? "Log in"
                  : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login")
                setError("")
              }}
            >
              {mode === "login" ? "Create one" : "Log in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
