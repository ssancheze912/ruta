import { useState } from 'react'
import { Button } from 'siesa-ui-kit'
import { useContactos } from '@/modules/crm/contactos/application/useContactos'
import type { Contacto } from '@/modules/crm/contactos/domain/Contacto'

interface AssociarContactoDialogProps {
  onSelect: (contacto: Contacto) => void
  isLoading: boolean
}

export function AssociarContactoDialog({ onSelect, isLoading }: AssociarContactoDialogProps) {
  const [open, setOpen] = useState(false)
  const { data: allContactos = [] } = useContactos()

  const available = allContactos.filter((c) => !c.clienteId)

  const handleSelect = (contacto: Contacto) => {
    onSelect(contacto)
    setOpen(false)
  }

  return (
    <>
      <Button
        type="default"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={isLoading}
      >
        Asociar contacto
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              Seleccionar contacto a asociar
            </h3>

            {available.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay contactos disponibles para asociar.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {available.map((c) => (
                  <li key={c.id}>
                    <Button
                      type="plain"
                      size="sm"
                      onClick={() => handleSelect(c)}
                      className="w-full text-left"
                    >
                      <span className="font-medium text-sm text-slate-800">{c.nombre}</span>
                      {c.cargo && (
                        <span className="ml-2 text-xs text-slate-500">{c.cargo}</span>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex justify-end">
              <Button type="outline-solid" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
