import { apiClient } from './apiClient'

interface LookupRequest {
  fields?: string[]
  search?: string
  searchFields?: string[]
  page?: number
  pageSize?: number
  filters?: Record<string, unknown> | Array<Array<Record<string, unknown>>>
  orderBy?: unknown
}

const toPascal = (key: string) => key.charAt(0).toUpperCase() + key.slice(1)

/**
 * Custom fetcher for LookupField.
 * LookupField expects the fetcher to return { data: T[] }, not a bare array.
 * It also sends filters in OR/AND format [[{ Id: 'xxx' }]] for fetchById calls.
 */
export const lookupFetcher = async (entity: string, request: LookupRequest) => {
  const { data } = await apiClient.get<Record<string, unknown>[]>(`/${entity}`)

  // Add PascalCase aliases first so filters with PascalCase keys (e.g. Id) work
  let items = (Array.isArray(data) ? data : []).map((item) => {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(item)) {
      result[key] = value            // camelCase original
      result[toPascal(key)] = value  // PascalCase alias (Id, Nombre, ClienteId, etc.)
    }
    return result
  })

  // Apply filters
  if (request.filters) {
    if (Array.isArray(request.filters)) {
      // OR/AND nested format used by fetchAndSetRecordById: [[{ Id: 'xxx' }]]
      const orGroups = request.filters as Array<Array<Record<string, unknown>>>
      items = items.filter((item) =>
        orGroups.some((andGroup) =>
          andGroup.every((condition) =>
            Object.entries(condition).every(([key, value]) => item[key] === value),
          ),
        ),
      )
    } else {
      // Simple object format: { clienteId: null }
      for (const [key, value] of Object.entries(request.filters as Record<string, unknown>)) {
        if (value === null) {
          items = items.filter((item) => item[key] === null || item[key] === undefined)
        } else if (value !== undefined) {
          items = items.filter((item) => item[key] === value)
        }
      }
    }
  }

  // Apply search
  const q = (request.search ?? '').toLowerCase().trim()
  if (q) {
    items = items.filter((item) =>
      Object.values(item).some((v) => typeof v === 'string' && v.toLowerCase().includes(q)),
    )
  }

  // LookupField expects { data: T[] } — NOT a bare array
  return { data: items }
}

/**
 * Fetcher dedicado para contactos sin cliente asignado.
 * Pre-filtra clienteId === null directamente, sin depender del sistema de filtros del LookupField.
 */
export const contactoOrphanFetcher = async (_entity: string, request: LookupRequest) => {
  const { data } = await apiClient.get<Record<string, unknown>[]>('/contactos')

  let items = (Array.isArray(data) ? data : [])
    .filter((item) => item['clienteId'] === null || item['clienteId'] === undefined)
    .map((item) => {
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(item)) {
        result[key] = value
        result[toPascal(key)] = value
      }
      return result
    })

  const q = (request.search ?? '').toLowerCase().trim()
  if (q) {
    items = items.filter((item) =>
      Object.values(item).some((v) => typeof v === 'string' && v.toLowerCase().includes(q)),
    )
  }

  return { data: items }
}
