import { apiClient } from '@/shared/lib/apiClient'
import type { Cliente } from '../domain/Cliente'
import type { CreateClienteDto, UpdateClienteDto, DeleteClienteResult, IClienteRepository } from '../domain/IClienteRepository'

export const clienteApiRepository: IClienteRepository = {
  async getAll(): Promise<Cliente[]> {
    const response = await apiClient.get<Cliente[]>('/clientes')
    return response.data
  },

  async getById(id: string): Promise<Cliente> {
    const response = await apiClient.get<Cliente>(`/clientes/${id}`)
    return response.data
  },

  async create(data: CreateClienteDto): Promise<Cliente> {
    const response = await apiClient.post<Cliente>('/clientes', data)
    return response.data
  },

  async update(id: string, data: UpdateClienteDto): Promise<Cliente> {
    const response = await apiClient.put<Cliente>(`/clientes/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<DeleteClienteResult> {
    const response = await apiClient.delete<DeleteClienteResult>(`/clientes/${id}`)
    return response.data
  },
}
