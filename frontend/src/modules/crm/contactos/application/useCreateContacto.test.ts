import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useCreateContacto } from './useCreateContacto'
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

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const validData = {
  nombre: 'Ana García',
  cargo: 'Analista',
  telefono: '3001234567',
  email: 'ana@test.com',
}

describe('useCreateContacto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns created contacto on 201', async () => {
    server.use(
      http.post(`${BASE}/contactos`, () =>
        HttpResponse.json(
          {
            id: 'new-id',
            nombre: validData.nombre,
            cargo: validData.cargo,
            telefono: validData.telefono,
            email: validData.email,
            clienteId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { status: 201 },
        ),
      ),
    )

    const { result } = renderHook(() => useCreateContacto(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(validData)
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('Contacto creado correctamente')
  })

  it('sets isError true on 422', async () => {
    server.use(
      http.post(`${BASE}/contactos`, () =>
        HttpResponse.json({ title: 'Validation failed' }, { status: 422 }),
      ),
    )

    const { result } = renderHook(() => useCreateContacto(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(validData)
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
