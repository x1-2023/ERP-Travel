"use client"

import { useEffect, useCallback } from "react"

interface HotkeyOptions {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  enabled?: boolean
}

type HotkeyHandler = (event: KeyboardEvent) => void

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const tagName = target.tagName.toLowerCase()
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  )
}

export function useHotkeys(
  options: HotkeyOptions | HotkeyOptions[],
  handler: HotkeyHandler,
  deps: unknown[] = []
) {
  const hotkeys = Array.isArray(options) ? options : [options]

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isInputElement(event.target)) return

      for (const hotkey of hotkeys) {
        if (hotkey.enabled === false) continue

        const keyMatch = event.key.toLowerCase() === hotkey.key.toLowerCase()
        const ctrlMatch = hotkey.ctrl ? event.ctrlKey : !event.ctrlKey
        const metaMatch = hotkey.meta ? event.metaKey : !event.metaKey
        const shiftMatch = hotkey.shift ? event.shiftKey : !event.shiftKey
        const altMatch = hotkey.alt ? event.altKey : !event.altKey

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          event.preventDefault()
          event.stopPropagation()
          handler(event)
          return
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handler, ...deps]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

export function useCommandK(handler: () => void) {
  useHotkeys(
    [
      { key: "k", meta: true },
      { key: "k", ctrl: true },
    ],
    handler
  )
}

export function useEscape(handler: () => void, enabled = true) {
  useHotkeys({ key: "Escape", enabled }, handler)
}
