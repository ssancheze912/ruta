import { useEffect, useRef, useState } from 'react'
import { Toast } from 'siesa-ui-kit'
import { TOAST_EVENT, type ToastItem } from '../lib/toast'

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const handler = (e: Event) => {
      const item = (e as CustomEvent<ToastItem>).detail
      setToasts((prev) => [...prev, item])
      const duration = item.duration ?? 5000
      if (duration > 0) {
        const timerId = setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== item.id))
          timers.current.delete(item.id)
        }, duration)
        timers.current.set(item.id, timerId)
      }
    }

    window.addEventListener(TOAST_EVENT, handler)
    return () => {
      window.removeEventListener(TOAST_EVENT, handler)
      timers.current.forEach(clearTimeout)
      timers.current.clear()
    }
  }, [])

  const handleClose = (id: string) => {
    const timerId = timers.current.get(id)
    if (timerId !== undefined) {
      clearTimeout(timerId)
      timers.current.delete(id)
    }
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          color={t.color}
          onClose={() => handleClose(t.id)}
        >
          {t.title}
        </Toast>
      ))}
    </div>
  )
}
