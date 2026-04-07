import type { Contacto } from './Contacto'

export interface IContactoRepository {
  getAll(): Promise<Contacto[]>
  getById(id: string): Promise<Contacto>
  create(data: { nombre: string; cargo: string; telefono: string; email: string }): Promise<Contacto>
  update(id: string, data: { nombre: string; cargo: string; telefono: string; email: string }): Promise<Contacto>
  getByClienteId(clienteId: string): Promise<Contacto[]>
  assignCliente(id: string, clienteId: string | null): Promise<Contacto>
  delete(id: string): Promise<void>
}
