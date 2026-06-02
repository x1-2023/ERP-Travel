import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"
import { HR_COPILOT_SYSTEM, HR_TOOLS } from "@/lib/ai/hr-copilot"
import { executeHRTool } from "@/lib/ai/tool-handler"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      response: "AI Copilot chưa được cấu hình. Vui lòng liên hệ admin.",
    })
  }

  const body = await request.json()
  const { messages } = body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 })
  }

  // Rate limit: max 20 messages, max 4000 chars per message
  if (messages.length > 20) {
    return NextResponse.json({ error: "Quá nhiều tin nhắn. Vui lòng xóa lịch sử chat." }, { status: 400 })
  }
  for (const m of messages) {
    if (typeof m.content !== "string" || m.content.length > 4000) {
      return NextResponse.json({ error: "Tin nhắn quá dài (tối đa 4000 ký tự)" }, { status: 400 })
    }
    if (!["user", "assistant"].includes(m.role)) {
      return NextResponse.json({ error: "Invalid message role" }, { status: 400 })
    }
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentMessages: any[] = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }))

    let finalText = ""

    // Agentic loop (max 5 iterations)
    for (let i = 0; i < 5; i++) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: HR_COPILOT_SYSTEM,
        tools: HR_TOOLS,
        messages: currentMessages,
      })

      if (response.stop_reason === "end_turn") {
        finalText = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("")
        break
      }

      if (response.stop_reason === "tool_use") {
        const toolUseBlocks = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
        )

        const toolResults = await Promise.all(
          toolUseBlocks.map(async (block) => ({
            type: "tool_result" as const,
            tool_use_id: block.id,
            content: await executeHRTool(
              block.name,
              block.input as Record<string, unknown>,
              session.user.role
            ),
          }))
        )

        currentMessages = [
          ...currentMessages,
          { role: "assistant", content: response.content },
          { role: "user", content: toolResults },
        ]
        continue
      }

      // Unexpected stop reason
      finalText = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
      break
    }

    if (!finalText) {
      finalText = "Không thể xử lý yêu cầu, vui lòng thử lại."
    }

    return NextResponse.json({ response: finalText })
  } catch (error) {
    console.error("[Copilot] Error:", error)
    return NextResponse.json({
      response: "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.",
    })
  }
}
