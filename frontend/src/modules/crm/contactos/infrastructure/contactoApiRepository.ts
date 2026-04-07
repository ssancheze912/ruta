import { apiClient } from '@/shared/lib/apiClient'
import type { Contacto } from '../domain/Contacto'
import type { IContactoRepository } from '../domain/IContactoRepository'

class ContactoApiRepository implements IContactoRepository {
  async getAll(): Promise<Contacto[]> {
    const response = await apiClient.get<Contacto[]>('/contactos')
    return response.data
  }

  async getById(id: string): Promise<Contacto> {
    const response = await apiClient.get<Contacto>(`/contactos/${id}`)
    return response.data
  }

  async create(data: { nombre: string; cargo: string; telefono: string; email: string }): Promise<Contacto> {
    const response = await apiClient.post<Contacto>('/contactos', data)
    return response.data
  }

  async update(id: string, data: { nombre: string; cargo: string; telefono: string; email: string }): Promise<Contacto> {
    const response = await apiClient.put<Contacto>(`/contactos/${id}`, data)
    return response.data
  }

  async getByClienteId(clienteId: string): Promise<Contacto[]> {
    const response = await apiClient.get<Contacto[]>('/contactos', { params: { clienteId } })
    return response.data
  }

  async assignCliente(id: string, clienteId: string | null): Promise<Contacto> {
    const response = await apiClient.put<Contacto>(`/contactos/${id}/cliente`, { clienteId })
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/contactos/${id}`)
  }
}

export const contactoRepository = new ContactoApiRepository()
