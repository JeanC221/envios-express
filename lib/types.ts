export interface TimelineItem {
  estado: string
  fecha: string
}

export interface Pedido {
  id: string
  trackingId: string
  origen: string
  destino: string
  peso: string
  tipoEnvio: string
  costo: number
  estado: string
  fecha: string
  metodoPago: string
  timeline: TimelineItem[]
  descuentoAplicado: number
}

export interface PedidoCardProps {
  pedido: Pedido
}

export interface Descuento {
  id: number
  nombre: string
  descripcion: string
  porcentaje: number
  reclamado: boolean
}

export interface DescuentoCardProps {
  descuento: Descuento
  onReclamar: (id: number) => void
  isActive: boolean
}
