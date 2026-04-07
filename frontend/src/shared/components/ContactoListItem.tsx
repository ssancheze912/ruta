import type { Contacto } from '@/modules/crm/contactos/domain/Contacto'

interface ContactoListItemProps {
  contacto: Contacto
  isSelected: boolean
  onClick: () => void
}

export function ContactoListItem({ contacto, isSelected, onClick }: ContactoListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left px-4 py-3 border-b border-slate-100 transition-colors',
        'hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500',
        isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : '',
      ].join(' ')}
      aria-pressed={isSelected}
    >
      <p className="text-sm font-medium text-slate-800 truncate">{contacto.nombre}</p>
      <p className="text-xs text-slate-500 mt-0.5">{contacto.cargo}</p>
    </button>
  )
}
