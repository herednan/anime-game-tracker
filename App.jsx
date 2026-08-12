import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { useCollection } from "./hooks/useCollection"
import { setToken } from "@/lib/api"
import { api } from "@/lib/api"
import { CATEGORIES, ICONS } from "@/lib/media"
import AuthScreen from "@/components/AuthScreen"
import Assistant from "@/components/Assistant"
import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import MediaRow from "@/components/MediaRow"
import MediaCard from "@/components/MediaCard"
import AddDialog from "@/components/AddDialog"
import EditDialog from "@/components/EditDialog"
import { Button } from "@/components/ui/button"

function CollectionApp({ username, onLogout }) {
  const { collection, setCollection, loading } = useCollection()
  const [view, setView] = useState("home")
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const counts = {
    movies: collection.movies.length,
    anime: collection.anime.length,
    games: collection.games.length,
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const pick = (list) =>
      term ? list.filter((i) => i.title.toLowerCase().includes(term)) : list
    return {
      movies: pick(collection.movies),
      anime: pick(collection.anime),
      games: pick(collection.games),
    }
  }, [collection, search])

  const all = [...filtered.movies, ...filtered.anime, ...filtered.games]
  const topRating = Math.max(0, ...all.map((i) => i.rating ?? 0))
  const featured =
    all.find((i) => i.rating === topRating && i.rating) ??
    all.sort((a, b) => b.addedAt - a.addedAt)[0]

  const addItem = async (data) => {
    const created = await api("/api/items", {
      method: "POST",
      body: JSON.stringify(data),
    })
    setCollection((prev) => ({
      ...prev,
      [created.type]: [created, ...prev[created.type]],
    }))
  }

  const toggleItem = async (item) => {
    const status = item.status === "done" ? "ongoing" : "done"
    const updated = await api(`/api/items/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
    setCollection((prev) => ({
      ...prev,
      [item.type]: prev[item.type].map((i) => (i.id === item.id ? updated : i)),
    }))
  }

  const deleteItem = async (item) => {
    if (!window.confirm(`Remove "${item.title}" from your list?`)) return
    await api(`/api/items/${item.id}`, { method: "DELETE" })
    setCollection((prev) => ({
      ...prev,
      [item.type]: prev[item.type].filter((i) => i.id !== item.id),
    }))
  }

  const saveEdit = async (data) => {
    const updated = await api(`/api/items/${editing.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    setCollection((prev) => ({
      ...prev,
      [editing.type]: prev[editing.type].map((i) =>
        i.id === editing.id ? updated : i
      ),
    }))
    setEditing(null)
  }

  const rowHandlers = {
    onToggle: toggleItem,
    onEdit: (item) => setEditing(item),
    onDelete: deleteItem,
    onAdd: () => setAddOpen(true),
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141414] text-muted-foreground">
        Loading your collection...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414] text-foreground">
      <Navbar
        view={view}
        onViewChange={setView}
        counts={counts}
        search={search}
        onSearchChange={setSearch}
        username={username}
        onLogout={onLogout}
        onAdd={() => setAddOpen(true)}
      />

      <main className="pt-14">
        {view === "home" ? (
          <>
            <Hero featured={featured} onAdd={() => setAddOpen(true)} />
            <div id="browse" className="space-y-9 py-8">
              <MediaRow type="movies" items={filtered.movies} {...rowHandlers} />
              <MediaRow type="anime" items={filtered.anime} {...rowHandlers} />
              <MediaRow type="games" items={filtered.games} {...rowHandlers} />
            </div>
          </>
        ) : (
          <CategoryGrid
            type={view}
            items={filtered[view]}
            onAdd={() => setAddOpen(true)}
            {...rowHandlers}
          />
        )}
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground">
        Signed in as {username} · Your data is saved on the server.
      </footer>

      <AddDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addItem} />

      <EditDialog
        key={editing?.id ?? "none"}
        item={editing}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        onSave={saveEdit}
      />

      <Assistant collection={collection} />
    </div>
  )
}

function CategoryGrid({ type, items, onToggle, onEdit, onDelete, onAdd }) {
  const cat = CATEGORIES[type]
  const Icon = ICONS[cat.icon]
  const sorted = [...items].sort((a, b) => b.addedAt - a.addedAt)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-black text-white">
          <Icon className="size-6 text-[#e50914]" />
          {cat.label}
          <span className="ml-1 rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-semibold text-muted-foreground">
            {items.length}
          </span>
        </h1>
        <Button
          className="bg-[#e50914] text-white hover:bg-[#f6121d]"
          onClick={onAdd}
        >
          <Plus data-icon="inline-start" />
          Add {cat.label.slice(0, -1)}
        </Button>
      </div>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sorted.map((item) => (
            <MediaCard
              key={item.id}
              type={type}
              item={item}
              onToggle={() => onToggle(item)}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
            />
          ))}
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-white/15 py-20 text-muted-foreground transition hover:border-[#e50914] hover:text-white"
        >
          <Plus className="size-8" />
          <span>No {cat.label.toLowerCase()} here yet — add your first</span>
        </button>
      )}
    </div>
  )
}

function App() {
  const [auth, setAuth] = useState(() => {
    const username = localStorage.getItem("mycollection.username")
    const token = localStorage.getItem("mycollection.token")
    if (token) setToken(token)
    return token ? { username } : null
  })

  const handleAuth = ({ token, username }) => {
    localStorage.setItem("mycollection.token", token)
    localStorage.setItem("mycollection.username", username)
    setToken(token)
    setAuth({ username })
  }

  const handleLogout = () => {
    localStorage.removeItem("mycollection.token")
    localStorage.removeItem("mycollection.username")
    setToken(null)
    setAuth(null)
  }

  if (!auth) {
    return <AuthScreen onAuth={handleAuth} />
  }

  return <CollectionApp username={auth.username} onLogout={handleLogout} />
}

export default App
