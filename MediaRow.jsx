import { Plus } from "lucide-react"
import MediaCard from "@/components/MediaCard"
import { CATEGORIES, ICONS } from "@/lib/media"

export default function MediaRow({ type, items, onToggle, onEdit, onDelete, onAdd }) {
  const cat = CATEGORIES[type]
  const Icon = ICONS[cat.icon]

  return (
    <section id={type} className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
          <Icon className="size-5 text-[#e50914]" />
          {cat.label}
        </h2>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="scroll-row flex gap-4 overflow-x-auto pb-3">
          {items.map((item) => (
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
          className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-white/15 py-10 text-muted-foreground transition hover:border-[#e50914] hover:text-white"
        >
          <Plus className="size-6" />
          <span className="text-sm">
            Nothing here yet — add your first {cat.label.toLowerCase()}
          </span>
        </button>
      )}
    </section>
  )
}
