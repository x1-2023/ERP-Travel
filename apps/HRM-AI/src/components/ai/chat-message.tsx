'use client'

import { cn } from '@/lib/utils'
import type { AIMessage } from '@/types/ai'
import { Button } from '@/components/ui/button'
import { Bot, User } from 'lucide-react'
import Link from 'next/link'
import { buildActionUrl } from '@/lib/ai/action-executor'

interface ChatMessageProps {
  message: AIMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'bg-muted/50' : 'bg-background'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-green-500 text-white'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="text-sm font-medium">
          {isUser ? 'Bạn' : 'HR Assistant'}
        </div>

        <div className="prose prose-sm max-w-none">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className="mb-1">
              {line}
            </p>
          ))}
        </div>

        {message.action && (
          <div className="mt-3">
            <Button asChild size="sm" variant="outline">
              <Link href={buildActionUrl(message.action)}>
                {message.action.label || 'Thực hiện'}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
