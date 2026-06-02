'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import type { AIMessage } from '@/types/ai'
import { Bot, X, Minimize2, Maximize2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatWidgetProps {
  defaultOpen?: boolean
}

export function ChatWidget({ defaultOpen = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content:
            'Xin chào! 👋 Tôi là trợ lý HR của bạn. Tôi có thể giúp bạn:\n\n• Tra cứu số ngày phép còn lại\n• Tạo đơn xin nghỉ, tăng ca\n• Hỏi đáp về chính sách công ty\n• Xem thông tin chấm công, lương\n\nBạn cần hỗ trợ gì?',
          createdAt: new Date(),
        },
      ])
    }
  }, [isOpen, messages.length])

  const handleSend = async (content: string) => {
    // Add user message immediately
    const userMessage: AIMessage = {
      role: 'user',
      content,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      // Save conversation ID for future messages
      if (data.conversationId) {
        setConversationId(data.conversationId)
      }

      // Add assistant message
      setMessages((prev) => [...prev, data.message])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
          createdAt: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([])
    setConversationId(null)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 h-12 w-12 md:h-9 md:w-9 rounded-full md:rounded-sm z-40 shadow-lg [&_svg]:size-auto"
      >
        <Bot className="h-8 w-8 md:h-7 md:w-7" />
      </Button>
    )
  }

  return (
    <div
      className={cn(
        'fixed z-40 flex flex-col bg-card border border-border rounded-xl md:rounded-sm transition-all shadow-2xl',
        // Mobile: full width, above bottom nav
        'bottom-20 left-2 right-2 md:bottom-6 md:left-auto md:right-6',
        isMinimized
          ? 'h-[60px] md:w-[300px]'
          : 'h-[70vh] md:h-[600px] md:w-[400px] md:max-h-[80vh]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-primary text-primary-foreground rounded-t-sm">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-medium">HR Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={handleClear}
              title="Xóa cuộc hội thoại"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="divide-y">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            placeholder="Hỏi tôi bất cứ điều gì về HR..."
          />
        </>
      )}
    </div>
  )
}
