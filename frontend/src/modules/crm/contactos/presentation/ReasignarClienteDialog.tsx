import { useState } from 'react'
import { Button, Select } from 'siesa-ui-kit'
import type { SelectOption } from 'siesa-ui-kit'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useClientes } from '@/modules/crm/clientes/application/useClientes'
import { useReassignContactoCliente } from '../application/useReassignContactoCliente'

interface ReasignarClienteDialogProps {
  contactoId: string
  currentClienteId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReasignarClienteDialog({
  contactoId,
  currentClienteId,
  open,
  onOpenChange,
}: ReasignarClienteDialogProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<string | undefined>(undefined)
  const { clientes, isLoading: isClientesLoading } = useClientes()
  const reassignMutation = useReassignContactoCliente()

  const options: SelectOption[] = clientes
    .filter((c) => c.id !== currentClienteId)
    .map((c) => ({ value: c.id, label: c.nombre }))

  const handleClose = () => {
    setSelectedClienteId(undefined)
    onOpenChange(false)
  }

  const handleConfirm = () => {
    if (!selectedClienteId) return
    reassignMutation.mutate(
      { contactoId, newClienteId: selectedClienteId, oldClienteId: currentClienteId },
      { onSuccess: handleClose },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reasignar a otro cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Select
            options={options}
            value={selectedClienteId}
            onChange={(val) => setSelectedClienteId(String(val))}
            placeholder="Seleccionar cliente..."
            disabled={isClientesLoading || reassignMutation.isPending}
            fullWidth
            ariaLabel="Seleccionar cliente destino"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="outline-solid"
              onClick={handleClose}
              disabled={reassignMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedClienteId || reassignMutation.isPending}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
