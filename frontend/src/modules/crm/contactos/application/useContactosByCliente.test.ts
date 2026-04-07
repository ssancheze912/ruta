import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useContactosByCliente } from './useContactosByCliente'
import { contactoRepository } from '../infrastructure/contactoApiRepository'
import type { Contacto } from '../domain/Contacto'

vi.mock('../infrastructure/contactoApiRepository', () => ({
  contactoRepository: {
    getByClienteId: vi.fn(),
  },
}))

const CLIENT_ID = '550e8400-e29b-41d4-a716-446655440000'

const mockContactos: Contacto[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    nombre: 'Ana García',
    cargo: 'Gerente',
    telefono: '3001234567',
    email: 'ana@empresa.com',
    clienteId: CLIENT_ID,
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    nombre: 'Carlos López',
    cargo: 'Comercial',
    telefono: '3009876543',
    email: 'carlos@empresa.com',
    clienteId: CLIENT_ID,
    createdAt: '2026-03-15T11:00:00Z',
    updatedAt: '2026-03-15T11:00:00Z',
  },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useContactosByCliente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns contacts for clienteId', async () => {
    vi.mocked(contactoRepository.getByClienteId).mockResolvedValue(mockContactos)

    const { result } = renderHook(() => useContactosByCliente(CLIENT_ID), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(contactoRepository.getByClienteId).toHaveBeenCalledWith(CLIENT_ID)
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].nombre).toBe('Ana García')
  })

  it('returns empty array when no contacts associated', async () => {
    vi.mocked(contactoRepository.getByClienteId).mockResolvedValue([])

    const { result } = renderHook(() => useContactosByCliente(CLIENT_ID), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(0)
  })

  it('sets isError true on fetch failure', async () => {
    vi.mocked(contactoRepository.getByClienteId).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useContactosByCliente(CLIENT_ID), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
