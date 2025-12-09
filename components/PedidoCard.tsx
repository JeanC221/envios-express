import React, { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Truck, Calendar, DollarSign } from "lucide-react"
import type { PedidoCardProps } from "@/lib/types"

export const PedidoCard: React.FC<PedidoCardProps> = ({ pedido }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-gray-300 bg-gray-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
            <Truck className="w-4 h-4 mr-2" />
            Pedido #{pedido.trackingId}
          </CardTitle>
          <Badge variant="outline" className="text-blue-600 border-blue-500">
            {pedido.estado}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              <span className="font-semibold">Origen:</span> {pedido.origen}
            </div>
            <div>
              <span className="font-semibold">Destino:</span> {pedido.destino}
            </div>
            <div>
              <span className="font-semibold">Peso:</span> {pedido.peso} kg
            </div>
            <div>
              <span className="font-semibold">Tipo:</span> {pedido.tipoEnvio}
            </div>
            <div className="col-span-2 flex items-center mt-2">
              <DollarSign className="w-4 h-4 mr-1 text-green-600" />
              <span className="font-semibold">Costo:</span> ${pedido.costo.toFixed(2)}
              {pedido.descuentoAplicado > 0 && (
                <Badge variant="secondary" className="ml-2 bg-green-600 text-white">
                  -{pedido.descuentoAplicado}%
                </Badge>
              )}
            </div>
            <div className="col-span-2 flex items-center mt-2">
              <Calendar className="w-4 h-4 mr-1 text-gray-500" />
              <span className="font-semibold">Fecha:</span> {pedido.fecha}
            </div>
          </div>
          <div className="mt-4">
            <span className="font-semibold text-gray-700">Timeline:</span>
            <ul className="ml-4 mt-1 list-disc text-xs text-gray-500">
              {pedido.timeline.map((item, idx) => (
                <li key={idx}>
                  {item.estado} - {item.fecha}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PedidoCard