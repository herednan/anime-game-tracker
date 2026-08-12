import { useEffect, useState } from "react"
import { api } from "@/lib/api"

const empty = { movies: [], anime: [], games: [] }

export function useCollection() {
  const [collection, setCollection] = useState(empty)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const rows = await api("/api/items")
      const grouped = { movies: [], anime: [], games: [] }
      for (const row of rows) {
        if (grouped[row.type]) grouped[row.type].push(row)
      }
      setCollection(grouped)
    } catch (err) {
      console.error("Failed to load collection", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { collection, setCollection, loading, refresh }
}
