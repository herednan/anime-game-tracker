import { Search, Plus, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const LINKS = [
  { key: "home", label: "Home" },
  { key: "movies", label: "Movies" },
  { key: "anime", label: "Anime" },
  { key: "games", label: "Games" },
]

export default function Navbar({
  view,
  onViewChange,
  counts,
  search,
  onSearchChange,
  username,
  onLogout,
  onAdd,
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <button
          onClick={() => onViewChange("home")}
          className="text-lg font-black tracking-tight sm:text-xl"
        >
          MY<span className="text-[#e50914]">COLLECTION</span>
        </button>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          {LINKS.map((link) => {
            const active = view === link.key
            const count = link.key === "home" ? null : counts[link.key]
            return (
              <button
                key={link.key}
                onClick={() => onViewChange(link.key)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition sm:text-sm",
                  active
                    ? "bg-white/10 font-bold text-white"
                    : "text-muted-foreground hover:text-white"
                )}
              >
                {link.label}
                {count != null && (
                  <span className="ml-1 text-[10px] text-[#e50914]">{count}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="flex-1" />

        <div className="relative hidden sm:block">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 w-40 bg-white/5 pl-8 transition-all focus:w-56"
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Button onClick={onAdd} className="h-8">
          <Plus data-icon="inline-start" />
          Add
        </Button>

        <div className="hidden items-center gap-2 sm:flex">
          <Badge variant="secondary" className="h-6">
            {username}
          </Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onLogout}
            aria-label="Log out"
          >
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  )
}
