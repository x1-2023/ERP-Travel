// ── In-process Event Bus (singleton) ──────────────────────────────
// Fire-and-forget pub/sub. Handlers never block the caller.

type EventHandler = (payload: unknown) => void | Promise<void>

class EventBus {
  private handlers = new Map<string, EventHandler[]>()

  on(event: string, handler: EventHandler): void {
    const list = this.handlers.get(event) || []
    list.push(handler)
    this.handlers.set(event, list)
  }

  off(event: string, handler: EventHandler): void {
    const list = this.handlers.get(event)
    if (!list) return
    this.handlers.set(
      event,
      list.filter((h) => h !== handler)
    )
  }

  /** Register a handler for ALL events */
  onAny(handler: (event: string, payload: unknown) => void | Promise<void>): void {
    const wrapped: EventHandler = (p) => handler('__any__', p)
    ;(wrapped as any).__onAny = handler
    const list = this.handlers.get('*') || []
    list.push(wrapped)
    this.handlers.set('*', list)
  }

  async emit(event: string, payload: unknown): Promise<void> {
    const specific = this.handlers.get(event) || []
    const wildcard = this.handlers.get('*') || []

    const tasks: Promise<void>[] = []

    for (const handler of specific) {
      tasks.push(
        Promise.resolve()
          .then(() => handler(payload))
          .catch((err) => {
            console.error(`[EventBus] Handler error for "${event}":`, err)
          })
      )
    }

    for (const handler of wildcard) {
      const onAnyFn = (handler as any).__onAny
      if (onAnyFn) {
        tasks.push(
          Promise.resolve()
            .then(() => onAnyFn(event, payload))
            .catch((err) => {
              console.error(`[EventBus] Wildcard handler error for "${event}":`, err)
            })
        )
      }
    }

    await Promise.allSettled(tasks)
  }
}

export const eventBus = new EventBus()
