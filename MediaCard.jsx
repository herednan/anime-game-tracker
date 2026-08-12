import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CATEGORIES, ICONS, STATUS_BADGE, statusLabel, metaText } from "@/lib/media"
import { cn } from "@/lib/utils"

export default function MediaCard({ type, item, onToggle, onEdit, onDelete }) {
  const cat = CATEGORIES[type]
  const Icon = ICONS[cat.icon]
  const done = item.status === "done"
  const meta = metaText(item, type)

  return (
    <div className="group relative w-36 shrink-0 sm:w-44">
      <div
        className={cn(
          "relative aspect-[2/3] overflow-hidden rounded-md bg-gradient-to-br ring-1 ring-white/10 transition group-hover:ring-white/30",
          cat.accent
        )}
      >
        <div className="flex h-full items-center justify-center">
          <Icon className="size-14 text-white/35" />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/90 to-transparent pb-2 opacity-0 transition group-hover:opacity-100">
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            onClick={onToggle}
            aria-label={done ? "Mark as in progress" : "Mark as done"}
          >
            {done ? (
              <CheckCircle2 className="text-emerald-400" />
            ) : (
              <Circle />
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            onClick={onEdit}
            aria-label="Edit"
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="hover:bg-destructive hover:text-white"
            onClick={onDelete}
            aria-label="Delete"
          >
            <Trash2 />
          </Button>
        </div>

        <div className="absolute top-2 left-2">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
              STATUS_BADGE[item.status]
            )}
          >
            {statusLabel(type, item.status)}
          </span>
        </div>
      </div>

      <div className="mt-2">
        <div className="truncate text-sm font-semibold text-white">
          {item.title}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {meta || "No details yet"}
        </div>
      </div>
    </div>
  )
}
