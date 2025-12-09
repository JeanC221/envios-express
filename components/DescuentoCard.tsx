import React from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DescuentoCardProps } from "@/lib/types"

export const DescuentoCard: React.FC<DescuentoCardProps> = ({ descuento, onReclamar, isActive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="border-gray-300 bg-gray-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{descuento.nombre}</CardTitle>
        <Badge variant="outline" className={descuento.reclamado ? "text-gray-500 border-gray-400" : "text-green-600 border-green-500"}>
          {descuento.reclamado ? (isActive ? "Activo" : "Reclamado") : "Disponible"}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{descuento.descripcion}</p>
        {!descuento.reclamado && (
          <Button 
            onClick={() => onReclamar(descuento.id)} 
            className="mt-2 w-auto px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200"
          >
            Reclamar y Aplicar
          </Button>
        )}
      </CardContent>
    </Card>
  </motion.div>
)

export default DescuentoCard