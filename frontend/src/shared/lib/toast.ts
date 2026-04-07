// Imperative toast API — dispatches custom events consumed by ToastContainer

export type ToastColor =
  | 'zinc' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald'
  | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia'
  | 'pink' | 'rose' | 'primary' | 'secondary' | 'tertiary'

export interface ToastOptions {
  title: string
  description?: string
  color?: ToastColor
  duration?: number
}

export interface ToastItem extends ToastOptions {
  id: string
}

const TOAST_EVENT = 'siesa:toast'

export function dispatchToast(options: ToastOptions) {
  const item: ToastItem = { ...options, id: crypto.randomUUID() }
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: item }))
}

export const toast = {
  show: (options: ToastOptions) => dispatchToast(options),
  success: (title: string, description?: string) =>
    dispatchToast({ title, description, color: 'green' }),
  error: (title: string, description?: string) =>
    dispatchToast({ title, description, color: 'red' }),
  warning: (title: string, description?: string) =>
    dispatchToast({ title, description, color: 'amber' }),
  info: (title: string, description?: string) =>
    dispatchToast({ title, description, color: 'blue' }),
}

export { TOAST_EVENT }
