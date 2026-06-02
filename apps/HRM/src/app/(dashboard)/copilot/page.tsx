"use client"

import { ChatInterface } from "@/components/copilot/chat-interface"
import { Sparkles } from "lucide-react"

export default function CopilotPage() {
  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5" style={{ color: "#1E3A5F" }} />
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          HR Copilot
        </h1>
      </div>
      <ChatInterface />
    </div>
  )
}
