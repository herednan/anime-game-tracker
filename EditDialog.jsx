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

export default function EditDialog({ item, open, onOpenChange, onSave }) {
  const [title, setTitle] = useState(item?.title ?? "")
  const [status, setStatus] = useState(item?.status ?? "done")
  const [rating, setRating] = useState(
    item?.rating ? String(item.rating) : "none"
  )
  const [extra, setExtra] = useState(() =>
    Object.fromEntries(
      CATEGORIES[item?.type ?? "movies"].fields.map((f) => [
        f.key,
        item?.[f.key] != null ? String(item[f.key]) : "",
      ])
    )
  )
  const cat = CATEGORIES[item?.type ?? "movies"]

  const save = () => {
    if (!title.trim()) return
    onSave({
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
          <DialogTitle>Edit {cat.label.slice(0, -1)}</DialogTitle>
          <DialogDescription>Update the details of this entry.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="edit-status" className="w-full">
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
              <Label htmlFor="edit-rating">Rating</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger id="edit-rating" className="w-full">
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
              <Label htmlFor={`edit-${f.key}`}>{f.label}</Label>
              <Input
                id={`edit-${f.key}`}
                type="number"
                min="0"
                max={f.max}
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
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
