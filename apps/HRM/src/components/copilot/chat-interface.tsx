"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const QUICK_PROMPTS = [
  "Thống kê tổng quan",
  "HĐ sắp hết hạn",
  "Báo cáo chờ duyệt",
  "Phân tích bất thường chấm công tháng này",
  "Gợi ý OT và nghỉ phép chưa ghi nhận",
  "Dự báo nhân lực tuần tới",
  "Tóm tắt lương tháng này",
]

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: `Xin chào! Tôi là **AI HR Copilot** của RTR. Bạn có thể hỏi tôi về:
- Thông tin nhân viên, hợp đồng sắp hết hạn
- Báo cáo chờ duyệt, bảng lương, ngày phép
- **Phân tích bất thường chấm công** (đi muộn, vắng, pattern)
- **Gợi ý OT/nghỉ phép** chưa ghi nhận
- **Dự báo nhân lực** tuần tới
- Thống kê tổng quan phòng ban`,
}

function SafeMarkdown({ text }: { text: string }) {
  const lines = text.split("\n")
  return (
    <>
      {lines.map((line, i) => {
        const isBullet = line.startsWith("- ") || line.startsWith("• ")
        const content = isBullet ? line.substring(2) : line

        // Render bold segments safely
        const parts = content.split(/(\*\*.*?\*\*)/g)
        const rendered = parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j}>{part.slice(2, -2)}</strong>
          }
          return <span key={j}>{part}</span>
        })

        if (isBullet) {
          return <li key={i} className="ml-4">{rendered}</li>
        }
        return (
          <span key={i}>
            {i > 0 && <br />}
            {rendered}
          </span>
        )
      })}
    </>
  )
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMessage: Message = { role: "user", content: text.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      // Send only user/assistant messages (skip welcome)
      const apiMessages = newMessages
        .filter((_, i) => i > 0) // skip welcome
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      })

      const data = await res.json()
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "Không thể xử lý yêu cầu.",
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Lỗi kết nối. Vui lòng thử lại." },
      ])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([WELCOME_MESSAGE])
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-10rem)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1E3A5F" }}>
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <Card className={`max-w-[80%] ${msg.role === "user" ? "bg-muted" : ""}`}>
              <CardContent className="py-3 px-4">
                <div className="text-sm prose prose-sm max-w-none">
                  <SafeMarkdown text={msg.content} />
                </div>
              </CardContent>
            </Card>
            {msg.role === "user" && (
              <div className="shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1E3A5F" }}>
              <Bot className="h-4 w-4 text-white" />
            </div>
            <Card>
              <CardContent className="py-3 px-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 pb-3">
          {QUICK_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => sendMessage(prompt)}
              disabled={loading}
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 pt-3 border-t">
        <Button
          variant="ghost"
          size="icon"
          onClick={clearChat}
          className="shrink-0"
          title="Xoá cuộc trò chuyện"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              sendMessage(input)
            }
          }}
          placeholder="Hỏi bất cứ điều gì về HR..."
          disabled={loading}
          className="flex-1"
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{ backgroundColor: "#1E3A5F" }}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
