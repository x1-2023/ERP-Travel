// src/lib/ai/client.ts
// Anthropic Claude API Client

import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  systemPrompt: string
  maxTokens?: number
  temperature?: number
}

/**
 * Send a chat message to Claude and get a response
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions
): Promise<string> {
  const { systemPrompt, maxTokens = 1024, temperature = 0.7 } = options

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature,
  })

  // Extract text from response
  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text : ''
}

/**
 * Send a quick classification request
 */
export async function classify(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text.trim() : ''
}

/**
 * Stream a chat response
 */
export async function* streamChat(
  messages: ChatMessage[],
  options: ChatOptions
): AsyncGenerator<string> {
  const { systemPrompt, maxTokens = 1024, temperature = 0.7 } = options

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature,
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}

export { anthropic }
