import { Link } from '@tanstack/react-router'

export function NotFoundView() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold text-slate-700">Página no encontrada</h1>
      <p className="text-slate-500">La ruta que buscas no existe.</p>
      <Link to="/clientes" className="text-blue-600 underline hover:text-blue-800">
        Ir a Clientes
      </Link>
    </div>
  )
}
