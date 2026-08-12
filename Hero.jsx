import { Plus, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CATEGORIES, statusLabel, metaText } from "@/lib/media"

export default function Hero({ featured, onAdd }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#e50914]/50 via-black/80 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(229,9,20,0.25),transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-12 sm:pt-24">
        <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#ff6b73]">
          {featured ? "Featured in your collection" : "Your queue"}
        </span>
        <h1 className="mt-2 max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
          {featured ? featured.title : "Build your collection"}
        </h1>
        {featured ? (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                className="border-transparent bg-white/15 text-white"
              >
                {CATEGORIES[featured.type].label}
              </Badge>
              <Badge
                className="border-transparent bg-[#e50914] text-white"
              >
                {statusLabel(featured.type, featured.status)}
              </Badge>
              {metaText(featured, featured.type) && (
                <span className="text-sm font-medium text-white/80">
                  {metaText(featured, featured.type)}
                </span>
              )}
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
              {featured.rating
                ? `Your top pick — rated ${featured.rating} out of 5.`
                : `Currently in your ${CATEGORIES[featured.type].label.toLowerCase()} list.`}{" "}
              Keep tracking what you watch and play.
            </p>
          </>
        ) : (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
            Add the movies, anime, and games you&apos;ve watched and played — your
            whole collection in one place.
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="bg-[#e50914] text-white hover:bg-[#f6121d]"
            onClick={onAdd}
          >
            <Plus data-icon="inline-start" />
            Add to collection
          </Button>
          {featured && (
            <Button
              variant="outline"
              className="border-white/30 bg-white/5 text-white hover:bg-white/10"
              onClick={() =>
                document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Browse your list
              <ChevronDown data-icon="inline-end" />
            </Button>
          )}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#141414] to-transparent" />
    </div>
  )
}
