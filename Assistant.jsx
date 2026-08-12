import { useState } from "react"
import { ConfigProvider, theme } from "antd"
import { Bubble, Prompts, Sender } from "@ant-design/x"
import {
  RobotOutlined,
  UserOutlined,
  MessageOutlined,
  RocketOutlined,
  ClockCircleOutlined,
  StarOutlined,
  TrophyOutlined,
} from "@ant-design/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const HELP =
  "I can answer questions about your collection. Try asking:\n\n" +
  "• What movies do I have?\n" +
  "• What am I currently watching?\n" +
  "• What's my highest rated anime?\n" +
  "• How many games have I finished?"

function answerQuestion(raw, collection) {
  const q = raw.toLowerCase()
  const all = [...collection.movies, ...collection.anime, ...collection.games]
  const names = (list) =>
    list.length
      ? "\n\n" + list.map((i) => `• ${i.title}`).join("\n")
      : " Nothing here yet."
  const label = (type) =>
    type === "movies" ? "movie" : type === "anime" ? "anime" : "game"

  if (/hello|hi\b|hey|yo\b/.test(q)) {
    return "Hey there! 👋 Ask me anything about your collection."
  }
  if (/help|what can you/.test(q)) return HELP

  if (/movie|film/.test(q)) {
    const list = collection.movies
    const n = list.length
    return `You have ${n} movie${n === 1 ? "" : "s"}.${names(list)}`
  }
  if (/anime/.test(q)) {
    const list = collection.anime
    const n = list.length
    return `You have ${n} anime.${names(list)}`
  }
  if (/game|play|played/.test(q)) {
    const list = collection.games
    const n = list.length
    return `You have ${n} game${n === 1 ? "" : "s"}.${names(list)}`
  }

  if (/watch|ongoing|currently|progress/.test(q)) {
    const ongoing = all.filter((i) => i.status === "ongoing")
    const detail = ongoing.map((i) => {
      const extra =
        i.type === "anime"
          ? ` (S${i.season ?? "?"} Ep${i.episode ?? "?"})`
          : i.type === "games" && i.progress != null
            ? ` (${i.progress}% complete)`
            : ""
      return `• ${i.title}${extra}`
    })
    return `You're currently into ${ongoing.length} thing${
      ongoing.length === 1 ? "" : "s"
    }.` + (detail.length ? "\n\n" + detail.join("\n") : "")
  }
  if (/finish|done|complete|beaten/.test(q)) {
    const done = all.filter((i) => i.status === "done")
    return `You've finished ${done.length} item${done.length === 1 ? "" : "s"}.${names(done)}`
  }
  if (/plan|backlog|watch later/.test(q)) {
    const planned = all.filter((i) => i.status === "planned")
    return `You plan to watch/play ${planned.length} item${planned.length === 1 ? "" : "s"}.${names(planned)}`
  }
  if (/rating|best|top|favorite|favourite/.test(q)) {
    const rated = all.filter((i) => i.rating)
    const sorted = rated.sort((a, b) => b.rating - a.rating)
    if (!sorted.length) return "You haven't rated anything yet."
    const top = sorted
      .filter((i) => i.rating === sorted[0].rating)
      .map((i) => `• ${i.title} (${i.rating}/5)`)
    return `Your highest rated ${label(sorted[0].type)}${top.length === 1 ? " is" : "s are"}\n\n${top.join("\n")}`
  }
  if (/how many|total|count|stats|stats/.test(q)) {
    return (
      "Here's your collection:\n\n" +
      `• Movies: ${collection.movies.length}\n` +
      `• Anime: ${collection.anime.length}\n` +
      `• Games: ${collection.games.length}\n\n` +
      `Total: ${all.length}`
    )
  }

  return HELP
}

const SUGGESTIONS = [
  {
    key: "stats",
    icon: <TrophyOutlined />,
    label: "How many do I have?",
    description: "Get your totals",
  },
  {
    key: "watching",
    icon: <ClockCircleOutlined />,
    label: "What am I watching?",
    description: "Currently in progress",
  },
  {
    key: "best",
    icon: <StarOutlined />,
    label: "Highest rated",
    description: "Your favorites",
  },
  {
    key: "anime",
    icon: <RocketOutlined />,
    label: "My anime list",
    description: "Every anime you track",
  },
]

const PROMPTS_MAP = {
  stats: "How many do I have in total?",
  watching: "What am I currently watching?",
  best: "What's my highest rated item?",
  anime: "List my anime",
}

function Assistant({ collection }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState(() => [
    {
      key: "greeting",
      role: "ai",
      content: "Hi! I'm your Collection Assistant. Ask me about your movies, anime, and games. 🎬",
    },
  ])

  const ask = (message) => {
    const text = message.trim()
    if (!text || loading) return
    const id = Date.now()
    setMessages((prev) => [...prev, { key: `${id}-u`, role: "user", content: text }])
    setValue("")
    setLoading(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { key: `${id}-b`, role: "ai", content: answerQuestion(text, collection) },
      ])
      setLoading(false)
    }, 600)
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        className="fixed right-6 bottom-6 z-40 h-12 w-12 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Open assistant"
      >
        <MessageOutlined className="text-lg" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[min(620px,90vh)] flex-col gap-0 p-0 sm:max-w-xl">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle>Collection Assistant</DialogTitle>
          </DialogHeader>

          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorPrimary: "#a78bfa",
                colorBgContainer: "#1f2230",
                colorBgElevated: "#262a3b",
                borderRadius: 10,
              },
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="border-b p-3">
                <Prompts
                  vertical={false}
                  wrap
                  title="Try asking"
                  items={SUGGESTIONS.map((s) => ({ ...s, icon: <s.icon /> }))}
                  onItemClick={({ data }) => ask(PROMPTS_MAP[data.key])}
                />
              </div>

              <Bubble.List
                autoScroll
                items={messages}
                style={{ flex: 1, overflow: "auto", padding: "16px" }}
                role={{
                  ai: {
                    placement: "start",
                    typing: { step: 2, interval: 20 },
                    avatar: { icon: <RobotOutlined />, style: { background: "#7c6ff0" } },
                  },
                  user: {
                    placement: "end",
                    avatar: { icon: <UserOutlined />, style: { background: "#5b6472" } },
                  },
                }}
              />

              <div className="border-t p-3">
                <Sender
                  value={value}
                  onChange={(v) => setValue(v)}
                  onSubmit={(msg) => ask(msg)}
                  loading={loading}
                  placeholder="Ask about your collection..."
                />
              </div>
            </div>
          </ConfigProvider>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Assistant
