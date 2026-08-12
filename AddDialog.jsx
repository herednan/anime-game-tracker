import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES, RATINGS } from "@/lib/media"

const freshExtra = (type) =>
  Object.fromEntries(CATEGORIES[type].fields.map((f) => [f.key, ""]))

export default function AddDialog({ open, onOpenChange, onAdd }) {
  const [type, setType] = useState("movies")
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState("done")
  const [rating, setRating] = useState("none")
  const [extra, setExtra] = useState(() => freshExtra("movies"))
  const cat = CATEGORIES[type]

  const changeType = (next) => {
    setType(next)
    setStatus(CATEGORIES[next].statuses[0].value)
    setExtra(freshExtra(next))
  }

  const save = () => {
    if (!title.trim()) return
    onAdd({
      type,
      title: title.trim(),
      status,
      rating: rating === "none" ? null : Number(rating),
      ...Object.fromEntries(
        cat.fields.map((f) => {
          const v = extra[f.key]
          return [f.key, v === "" || v == null ? null : Number(v)]
        })
      ),
    })
    setTitle("")
    setRating("none")
    changeType("movies")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.tagName === "INPUT") {
            e.preventDefault()
            save()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Add to your collection</DialogTitle>
          <DialogDescription>
            Track a movie, anime, or game you&apos;ve watched or played.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="add-type">Type</Label>
            <Select value={type} onValueChange={changeType}>
              <SelectTrigger id="add-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORIES).map(([key, c]) => (
                  <SelectItem key={key} value={key}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-title">Title</Label>
            <Input
              id="add-title"
              placeholder="e.g. Inception"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="add-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cat.statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-rating">Rating</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger id="add-rating" className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No rating</SelectItem>
                  {RATINGS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {"★".repeat(Number(r))}
                      {"☆".repeat(5 - Number(r))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {cat.fields.map((f) => (
            <div key={f.key} className="w-28 space-y-1.5">
              <Label htmlFor={`add-${f.key}`}>{f.label}</Label>
              <Input
                id={`add-${f.key}`}
                type="number"
                min="0"
                max={f.max}
                placeholder={f.placeholder}
                value={extra[f.key]}
                onChange={(e) =>
                  setExtra((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!title.trim()}>
            Add to collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
