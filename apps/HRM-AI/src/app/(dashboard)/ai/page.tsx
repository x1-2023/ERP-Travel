'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Send,
  Sparkles,
  MessageSquare,
  Trash2,
  Plus,
  Loader2,
  User,
  ArrowRight,
  Clock,
  HelpCircle,
  FileText,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  intent?: string
  actions?: Array<{
    type: string
    params: Record<string, unknown>
    label: string
    url?: string
  }>
  suggestions?: string[]
  createdAt: Date
}

interface Conversation {
  id: string
  title: string
  messageCount: number
  updatedAt: string
}

const QUICK_ACTIONS = [
  { icon: Calendar, label: 'Xem ngày phép', message: 'Tôi còn bao nhiêu ngày phép?' },
  { icon: Clock, label: 'Chấm công tháng này', message: 'Thống kê chấm công tháng này' },
  { icon: FileText, label: 'Tạo đơn nghỉ phép', message: 'Tôi muốn tạo đơn xin nghỉ phép' },
  { icon: HelpCircle, label: 'Chính sách nghỉ phép', message: 'Quy định nghỉ phép năm như thế nào?' }
]

export default function HRCopilotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Load conversation history
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/copilot')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Welcome message
  useEffect(() => {
    if (messages.length === 0 && !conversationId) {
      setMessages([
        {
          role: 'assistant',
          content: `Xin chào! Tôi là **HR Copilot** - trợ lý AI thông minh của Lạc Việt HR.

Tôi có thể giúp bạn:
- Tra cứu ngày phép, thông tin chấm công
- Tạo đơn xin nghỉ, đăng ký tăng ca
- Giải đáp chính sách, quy định công ty
- Tạo báo cáo từ yêu cầu tự nhiên

Bạn cần hỗ trợ gì hôm nay?`,
          suggestions: [
            'Còn bao nhiêu ngày phép?',
            'Quy trình nghỉ thai sản',
            'Tạo đơn xin nghỉ phép ngày mai'
          ],
          createdAt: new Date()
        }
      ])
    }
  }, [messages.length, conversationId])

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      createdAt: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: content.trim()
        })
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      const data = await res.json()

      if (data.conversationId) {
        setConversationId(data.conversationId)
      }

      setMessages(prev => [
        ...prev,
        {
          id: data.message.id,
          role: 'assistant',
          content: data.message.content,
          intent: data.message.intent,
          actions: data.message.actions,
          suggestions: data.message.suggestions,
          createdAt: new Date(data.message.createdAt)
        }
      ])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
          createdAt: new Date()
        }
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setConversationId(null)
  }

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/copilot?conversationId=${id}`)
      if (res.ok) {
        const data = await res.json()
        setConversationId(id)
        setMessages(
          data.messages.map((m: Message) => ({
            ...m,
            createdAt: new Date(m.createdAt)
          }))
        )
        setShowHistory(false)
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const getActionUrl = (action: NonNullable<Message['actions']>[0]): string => {
    const urls: Record<string, string> = {
      navigate: action.params.page as string,
      create_leave_request: '/leave/requests/new',
      view_attendance: '/attendance',
      view_payslip: '/payroll/payslips'
    }
    return urls[action.type] || '/dashboard'
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Sidebar - Conversation History */}
      <div
        className={cn(
          'w-64 flex-shrink-0 border-r border-border bg-card transition-all',
          showHistory ? 'block' : 'hidden lg:block'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="font-semibold text-sm">Lịch sử chat</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleNewChat}
              title="Cuộc hội thoại mới"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-sm text-sm hover:bg-muted transition-colors',
                    conversationId === conv.id && 'bg-muted'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate flex-1">{conv.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {conv.messageCount} tin nhắn
                  </div>
                </button>
              ))}

              {conversations.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Chưa có lịch sử chat
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-gradient-to-br from-amber-500 to-orange-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">HR Copilot</h1>
              <p className="text-xs text-muted-foreground">Trợ lý AI thông minh</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowHistory(!showHistory)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Lịch sử
            </Button>
            {conversationId && (
              <Button variant="ghost" size="sm" onClick={handleNewChat}>
                <Plus className="h-4 w-4 mr-2" />
                Chat mới
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'justify-end'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-amber-500 to-orange-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[80%] rounded-sm p-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i} className="mb-1 last:mb-0">
                        {line.startsWith('- ') ? (
                          <span className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {line.slice(2)}
                          </span>
                        ) : line.startsWith('**') && line.endsWith('**') ? (
                          <strong>{line.slice(2, -2)}</strong>
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Intent Badge */}
                  {message.intent && message.role === 'assistant' && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {message.intent}
                      </Badge>
                    </div>
                  )}

                  {/* Actions */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action, i) => (
                        <Button
                          key={i}
                          variant="secondary"
                          size="sm"
                          asChild
                        >
                          <Link href={getActionUrl(action)}>
                            {action.label}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSend(suggestion)}
                          disabled={isLoading}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-amber-500 to-orange-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-sm p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Đang xử lý...
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions - Show when no messages yet */}
        {messages.length <= 1 && (
          <div className="px-4 pb-4">
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {QUICK_ACTIONS.map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2"
                    onClick={() => handleSend(action.message)}
                    disabled={isLoading}
                  >
                    <action.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={e => {
                e.preventDefault()
                handleSend(input)
              }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Hỏi HR Copilot bất cứ điều gì..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={!input.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              HR Copilot có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
