import React from "react"
import type { Pedido } from "@/lib/types"
import { PedidoCard } from "./PedidoCard"

interface PedidosHistorialProps {
  pedidos: Pedido[]
}

const PedidosHistorial: React.FC<PedidosHistorialProps> = ({ pedidos }) => (
  <div className="space-y-4">
    {pedidos.length === 0 ? (
      <p className="text-gray-600 text-center">No hay pedidos realizados aún.</p>
    ) : (
      pedidos.map((pedido) => (
        <PedidoCard key={pedido.id} pedido={pedido} />
      ))
    )}
  </div>
)

export default PedidosHistorial