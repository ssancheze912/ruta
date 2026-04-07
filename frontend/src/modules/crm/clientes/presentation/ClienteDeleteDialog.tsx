import { Alert } from 'siesa-ui-kit'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface ClienteDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clienteNombre: string
  onConfirm: () => void
  isPending: boolean
}

export function ClienteDeleteDialog({
  open,
  onOpenChange,
  clienteNombre,
  onConfirm,
  isPending,
}: ClienteDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden" showCloseButton={false}>
        <Alert
          title="¿Eliminar este cliente?"
          description={`Estás a punto de eliminar a ${clienteNombre}. Esta acción no se puede deshacer. Los contactos asociados quedarán sin cliente asignado.`}
          onCancel={() => onOpenChange(false)}
          onConfirm={onConfirm}
          confirmText="Eliminar"
          isProcess={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
