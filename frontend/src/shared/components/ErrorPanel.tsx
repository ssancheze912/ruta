import { Button } from 'siesa-ui-kit'

interface ErrorPanelProps {
  message?: string
  onRetry?: () => void
}

export function ErrorPanel({ message = 'No se pudo cargar la información.', onRetry }: ErrorPanelProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center gap-3">
      <p className="text-sm text-slate-600">{message}</p>
      {onRetry && (
        <Button onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
