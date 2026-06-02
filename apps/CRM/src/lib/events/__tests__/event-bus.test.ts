import { describe, it, expect, vi, beforeEach } from 'vitest'

// We need a fresh EventBus per test, not the singleton
// Import the module to get access to the class pattern
describe('EventBus', () => {
  // Create fresh EventBus for each test by re-importing
  let EventBus: any
  let eventBus: any

  beforeEach(async () => {
    // Reset module to get fresh singleton
    vi.resetModules()
    const mod = await import('../event-bus')
    eventBus = mod.eventBus
    // We'll use the singleton but it's fresh each time due to resetModules
  })

  describe('on() + emit()', () => {
    it('calls handler when event is emitted', async () => {
      const handler = vi.fn()
      eventBus.on('test', handler)
      await eventBus.emit('test', { foo: 'bar' })
      expect(handler).toHaveBeenCalledWith({ foo: 'bar' })
    })

    it('calls handler with correct payload', async () => {
      const handler = vi.fn()
      eventBus.on('order.created', handler)
      const payload = { orderId: '123', status: 'PENDING' }
      await eventBus.emit('order.created', payload)
      expect(handler).toHaveBeenCalledWith(payload)
    })

    it('supports multiple handlers for same event', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      eventBus.on('test', handler1)
      eventBus.on('test', handler2)
      await eventBus.emit('test', 'data')
      expect(handler1).toHaveBeenCalledOnce()
      expect(handler2).toHaveBeenCalledOnce()
    })

    it('does not call handlers for different events', async () => {
      const handler = vi.fn()
      eventBus.on('event_a', handler)
      await eventBus.emit('event_b', 'data')
      expect(handler).not.toHaveBeenCalled()
    })

    it('handles emit with no registered handlers', async () => {
      // Should not throw
      await expect(eventBus.emit('unregistered', {})).resolves.toBeUndefined()
    })
  })

  describe('off()', () => {
    it('removes a specific handler', async () => {
      const handler = vi.fn()
      eventBus.on('test', handler)
      eventBus.off('test', handler)
      await eventBus.emit('test', 'data')
      expect(handler).not.toHaveBeenCalled()
    })

    it('only removes the specified handler, not others', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      eventBus.on('test', handler1)
      eventBus.on('test', handler2)
      eventBus.off('test', handler1)
      await eventBus.emit('test', 'data')
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledOnce()
    })

    it('is safe to call off() for non-existent event', () => {
      const handler = vi.fn()
      expect(() => eventBus.off('nonexistent', handler)).not.toThrow()
    })
  })

  describe('onAny()', () => {
    it('receives all events', async () => {
      const handler = vi.fn()
      eventBus.onAny(handler)
      await eventBus.emit('event1', 'data1')
      await eventBus.emit('event2', 'data2')
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('receives event name and payload', async () => {
      const handler = vi.fn()
      eventBus.onAny(handler)
      await eventBus.emit('my.event', { key: 'value' })
      expect(handler).toHaveBeenCalledWith('my.event', { key: 'value' })
    })
  })

  describe('error isolation', () => {
    it('does not propagate handler errors', async () => {
      const errorHandler = vi.fn(() => { throw new Error('boom') })
      const goodHandler = vi.fn()
      eventBus.on('test', errorHandler)
      eventBus.on('test', goodHandler)

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await eventBus.emit('test', 'data')
      consoleSpy.mockRestore()

      // Good handler should still be called despite error in errorHandler
      expect(goodHandler).toHaveBeenCalledOnce()
    })

    it('does not propagate async handler errors', async () => {
      const errorHandler = vi.fn(async () => { throw new Error('async boom') })
      const goodHandler = vi.fn()
      eventBus.on('test', errorHandler)
      eventBus.on('test', goodHandler)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await expect(eventBus.emit('test', 'data')).resolves.toBeUndefined()
      consoleSpy.mockRestore()

      expect(goodHandler).toHaveBeenCalledOnce()
    })
  })

  describe('async handlers', () => {
    it('awaits all async handlers', async () => {
      const order: number[] = []
      eventBus.on('test', async () => {
        await new Promise((r) => setTimeout(r, 10))
        order.push(1)
      })
      eventBus.on('test', async () => {
        order.push(2)
      })
      await eventBus.emit('test', null)
      expect(order).toContain(1)
      expect(order).toContain(2)
    })
  })
})
