import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useDeleteContacto } from './useDeleteContacto'
import { toast } from '@/shared/lib/toast'

vi.mock('@/shared/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    show: vi.fn(),
  },
}))

const BASE = 'http://localhost:5000/api/v1'
const CONTACTO_ID = 'test-contacto-id'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  vi.spyOn(queryClient, 'invalidateQueries')
  vi.spyOn(queryClient, 'removeQueries')
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, queryClient }
}

describe('useDeleteContacto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes contacto and fires toast on 204', async () => {
    server.use(
      http.delete(`${BASE}/contactos/${CONTACTO_ID}`, () =>
        new HttpResponse(null, { status: 204 }),
      ),
    )

    const { wrapper, queryClient } = createWrapper()
    const { result } = renderHook(() => useDeleteContacto(CONTACTO_ID), { wrapper })
    await act(async () => {
      result.current.mutate()
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('Contacto eliminado correctamente')
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['contactos'] })
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ['contactos', CONTACTO_ID] })
  })

  it('sets isError true on 404', async () => {
    server.use(
      http.delete(`${BASE}/contactos/${CONTACTO_ID}`, () =>
        HttpResponse.json({ title: 'Not Found' }, { status: 404 }),
      ),
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useDeleteContacto(CONTACTO_ID), { wrapper })
    await act(async () => {
      result.current.mutate()
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
