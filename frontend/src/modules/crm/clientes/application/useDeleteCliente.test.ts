import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useDeleteCliente } from './useDeleteCliente'
import { toast } from '@/shared/lib/toast'

vi.mock('@/shared/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn(), show: vi.fn() },
}))

const BASE = 'http://localhost:5000/api/v1'
const clienteId = 'delete-test-id'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { queryClient, wrapper }
}

describe('useDeleteCliente', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls toast "eliminado correctamente", invalidates and removes queries when 0 contacts', async () => {
    server.use(
      http.delete(`${BASE}/clientes/${clienteId}`, () =>
        HttpResponse.json({ contactosDesasociados: 0 }, { status: 200 }),
      ),
    )
    const { queryClient, wrapper } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')

    const { result } = renderHook(() => useDeleteCliente(), { wrapper })
    await act(async () => {
      result.current.mutate(clienteId)
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(toast.success).toHaveBeenCalledWith('Cliente eliminado correctamente')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientes'] })
    expect(removeSpy).toHaveBeenCalledWith({ queryKey: ['clientes', clienteId] })
  })

  it('calls toast with contacts message when contactosDesasociados > 0', async () => {
    server.use(
      http.delete(`${BASE}/clientes/${clienteId}`, () =>
        HttpResponse.json({ contactosDesasociados: 2 }, { status: 200 }),
      ),
    )
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useDeleteCliente(), { wrapper })
    await act(async () => {
      result.current.mutate(clienteId)
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(toast.success).toHaveBeenCalledWith(
      'Cliente eliminado. Sus contactos asociados quedaron sin cliente asignado.',
    )
  })

  it('calls toast.error when API call fails', async () => {
    server.use(
      http.delete(`${BASE}/clientes/${clienteId}`, () =>
        HttpResponse.json({ title: 'Server Error' }, { status: 500 }),
      ),
    )
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useDeleteCliente(), { wrapper })
    await act(async () => {
      result.current.mutate(clienteId)
    })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('No se pudo eliminar el cliente.')
  })

  it('sets isError true on 404', async () => {
    server.use(
      http.delete(`${BASE}/clientes/${clienteId}`, () =>
        HttpResponse.json({ title: 'Not Found' }, { status: 404 }),
      ),
    )
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useDeleteCliente(), { wrapper })
    await act(async () => {
      result.current.mutate(clienteId)
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
