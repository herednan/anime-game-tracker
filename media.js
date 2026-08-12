import { Clapperboard, Sparkles, Gamepad2 } from "lucide-react"

export const ICONS = { Clapperboard, Sparkles, Gamepad2 }

export const CATEGORIES = {
  movies: {
    label: "Movies",
    icon: "Clapperboard",
    accent: "from-red-600 to-rose-900",
    fields: [],
    statuses: [
      { value: "done", label: "Watched" },
      { value: "ongoing", label: "Watching Now" },
      { value: "planned", label: "Plan to Watch" },
    ],
  },
  anime: {
    label: "Anime",
    icon: "Sparkles",
    accent: "from-fuchsia-600 to-purple-900",
    fields: [
      { key: "season", label: "Season", placeholder: "1" },
      { key: "episode", label: "Episode", placeholder: "12" },
    ],
    statuses: [
      { value: "done", label: "Finished" },
      { value: "ongoing", label: "Watching Now" },
      { value: "planned", label: "Plan to Watch" },
    ],
  },
  games: {
    label: "Games",
    icon: "Gamepad2",
    accent: "from-emerald-600 to-teal-900",
    fields: [
      { key: "progress", label: "Progress %", placeholder: "50", max: 100 },
    ],
    statuses: [
      { value: "done", label: "Finished / Beaten" },
      { value: "ongoing", label: "Playing Now" },
      { value: "planned", label: "Backlog" },
    ],
  },
}

export const RATINGS = ["5", "4", "3", "2", "1"]

export const STATUS_BADGE = {
  done: "bg-emerald-500/20 text-emerald-300 ring-emerald-400/30",
  ongoing: "bg-sky-500/20 text-sky-300 ring-sky-400/30",
  planned: "bg-amber-500/20 text-amber-300 ring-amber-400/30",
}

export function statusLabel(type, status) {
  const cat = CATEGORIES[type]
  return cat.statuses.find((s) => s.value === status)?.label ?? status
}

export function metaText(item, type) {
  const parts = []
  if (type === "anime") {
    if (item.season != null) parts.push(`S${item.season}`)
    if (item.episode != null) parts.push(`Ep${item.episode}`)
  }
  if (type === "games" && item.progress != null) {
    parts.push(`${item.progress}%`)
  }
  if (item.rating) parts.push("★".repeat(item.rating) + "☆".repeat(5 - item.rating))
  return parts.join(" · ")
}
