'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CreditCard, User, Send, LogIn, UserPlus, Percent, Wallet, ClipboardList, ArrowLeft, PlusCircle, MapPin, Calendar, DollarSign } from 'lucide-react'

interface TimelineItem {
  estado: string
  fecha: string
}

interface Pedido {
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

interface PedidoCardProps {
  pedido: Pedido
}

interface Descuento {
  id: number
  nombre: string
  descripcion: string
  porcentaje: number
  reclamado: boolean
}

interface DescuentoCardProps {
  descuento: Descuento
  onReclamar: (id: number) => void
  isActive: boolean
}

interface MetodoPago {
  id: number
  tipo: string
  numero: string
}

const PedidoCard: React.FC<PedidoCardProps> = ({ pedido }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-gray-300 bg-gray-100 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Pedido #{pedido.trackingId}</CardTitle>
          <Badge variant="outline" className="text-gray-600 border-gray-400">
            {pedido.estado}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500 mb-2">Fecha: {pedido.fecha}</div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              {pedido.origen} → {pedido.destino}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 border-gray-300 hover:bg-gray-200 transition-colors duration-200"
            >
              {isOpen ? 'Ocultar' : 'Detalle'}
            </Button>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-2 overflow-hidden"
              >
                <div className="text-sm text-gray-600">
                  <div>Tipo de envío: {pedido.tipoEnvio}</div>
                  <div>Peso: {pedido.peso} kg</div>
                  <div>Costo: ${pedido.costo.toFixed(2)}</div>
                  <div>Método de pago: {pedido.metodoPago}</div>
                  {pedido.descuentoAplicado > 0 && (
                    <div>Descuento aplicado: {pedido.descuentoAplicado}%</div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Línea de tiempo:</div>
                  {pedido.timeline.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div className="text-xs text-gray-600">{item.estado} - {item.fecha}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const DescuentoCard: React.FC<DescuentoCardProps> = ({ descuento, onReclamar, isActive }) => (
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

interface FormaPedido {
  origen: string
  destino: string
  peso: string
  tipoEnvio: string
}

export default function EnviosExpress() {
  const [pedido, setPedido] = useState<FormaPedido>({
    origen: '',
    destino: '',
    peso: '',
    tipoEnvio: 'normal'
  })
  const [costo, setCosto] = useState(0)
  const [trackingId, setTrackingId] = useState('')
  const [pedidoRealizado, setPedidoRealizado] = useState(false)
  const [activeTab, setActiveTab] = useState('nuevo-pedido')
  const [costoCalculado, setCostoCalculado] = useState(false)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeAccountTab, setActiveAccountTab] = useState('login')
  const [activeAccountSection, setActiveAccountSection] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [descuentoActivo, setDescuentoActivo] = useState<Descuento | null>(null)
  const [descuentos, setDescuentos] = useState<Descuento[]>([
    { id: 1, nombre: "Descuento de bienvenida", descripcion: "10% en tu primer envío", porcentaje: 10, reclamado: false },
    { id: 2, nombre: "Descuento de verano", descripcion: "15% en envíos internacionales", porcentaje: 15, reclamado: false },
    { id: 3, nombre: "Descuento de fidelidad", descripcion: "5% en todos los envíos", porcentaje: 5, reclamado: false },
  ])
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([
    { id: 1, tipo: "Tarjeta de crédito", numero: "**** **** **** 1234" },
    { id: 2, tipo: "Efectivo", numero: "N/A" },
  ])
  const [showNewCardForm, setShowNewCardForm] = useState(false)
  const [newCard, setNewCard] = useState({ numero: '', titular: '', fechaVencimiento: '', cvv: '' })

  useEffect(() => {
    const tabsList = document.querySelector('[role="tablist"]')
    if (tabsList) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
            const activeTabElement = tabsList.querySelector('[data-state="active"]')
            if (activeTabElement) {
              setActiveTab(activeTabElement.getAttribute('data-value') || 'nuevo-pedido')
            }
          }
        })
      })
      observer.observe(tabsList, { attributes: true, subtree: true })
      return () => observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'nuevo-pedido' && descuentoActivo && costoCalculado) {
      calcularCosto()
    }
  }, [activeTab, descuentoActivo])

  const calcularCosto = () => {
    if (pedido.peso) {
      const costoBase = parseFloat(pedido.peso) * 10
      const costoExpress = pedido.tipoEnvio === 'express' ? costoBase * 0.5 : 0
      const costoTotal = costoBase + costoExpress
      const descuentoAplicado = descuentoActivo ? costoTotal * (descuentoActivo.porcentaje / 100) : 0
      setCosto(costoTotal - descuentoAplicado)
      setCostoCalculado(true)
    }
  }

  const realizarPedido = () => {
    if (costo > 0 && isLoggedIn && selectedPaymentMethod) {
      const nuevoPedido: Pedido = {
        id: Math.random().toString(36).substr(2, 9),
        trackingId: Math.random().toString(36).substr(2, 9).toUpperCase(),
        origen: pedido.origen,
        destino: pedido.destino,
        peso: pedido.peso,
        tipoEnvio: pedido.tipoEnvio,
        costo: costo,
        estado: 'En proceso',
        fecha: new Date().toLocaleDateString(),
        metodoPago: selectedPaymentMethod,
        timeline: [
          { estado: 'Pedido realizado', fecha: new Date().toLocaleDateString() },
          { estado: 'En preparación', fecha: new Date(Date.now() + 86400000).toLocaleDateString() },
          { estado: 'En tránsito', fecha: new Date(Date.now() + 172800000).toLocaleDateString() },
          { estado: 'Entregado', fecha: new Date(Date.now() + 259200000).toLocaleDateString() },
        ],
        descuentoAplicado: descuentoActivo ? descuentoActivo.porcentaje : 0,
      }
      setPedidos([nuevoPedido, ...pedidos])
      setTrackingId(nuevoPedido.trackingId)
      setPedidoRealizado(true)
      setCostoCalculado(false)
      setSelectedPaymentMethod('')
      setPedido({
        origen: '',
        destino: '',
        peso: '',
        tipoEnvio: 'normal'
      })
      setCosto(0)
      setDescuentoActivo(null)
    }
  }

  const reiniciarFormulario = () => {
    setPedidoRealizado(false)
    setTrackingId('')
  }

  const reclamarDescuento = (id: number) => {
    const descuentoReclamado = descuentos.find(d => d.id === id)
    if (descuentoReclamado && !descuentoReclamado.reclamado) {
      setDescuentos(descuentos.map(d => 
        d.id === id ? {...d, reclamado: true} : d
      ))
      setDescuentoActivo(descuentoReclamado)
      if (costoCalculado) {
        calcularCosto()
      }
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggedIn(true)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggedIn(true)
  }

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault()
    const newId = metodosPago.length + 1
    const newMetodoPago: MetodoPago = {
      id: newId,
      tipo: "Tarjeta de crédito",
      numero: `**** **** **** ${newCard.numero.slice(-4)}`
    }
    setMetodosPago([...metodosPago, newMetodoPago])
    setShowNewCardForm(false)
    setNewCard({ numero: '', titular: '', fechaVencimiento: '', cvv: '' })
  }

  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-6 text-center flex items-center justify-center"
      >
        <span className="bg-gradient-to-r from-[#CA0007] to-[#FF4136] text-transparent bg-clip-text drop-shadow-lg">
          <Send className="w-10 h-10 mr-3 inline-block text-[#CA0007]" />
          EnviosYa
        </span>
      </motion.h1>

      <Tabs defaultValue="nuevo-pedido" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg overflow-hidden">
          <TabsTrigger value="nuevo-pedido" className="data-[state=active]:bg-[#CA0007] data-[state=active]:text-white text-gray-700 transition-all duration-200 flex items-center justify-center"
            onClick={() => setActiveTab('nuevo-pedido')}
          >
            <Package className="w-4 h-4 mr-2" />
            Nuevo Pedido
          </TabsTrigger>
          <TabsTrigger value="seguimiento"
            className="data-[state=active]:bg-[#CA0007] data-[state=active]:text-white text-gray-700 transition-all duration-200 flex items-center justify-center"
            onClick={() => setActiveTab('seguimiento')}
          >
            <Truck className="w-4 h-4 mr-2" />
            Seguimiento
          </TabsTrigger>
          <TabsTrigger value="cuenta"
            className="data-[state=active]:bg-[#CA0007] data-[state=active]:text-white text-gray-700 transition-all duration-200 flex items-center justify-center"
            onClick={() => setActiveTab('cuenta')}
          >
            <User className="w-4 h-4 mr-2" />
            Mi Cuenta
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <TabsContent value="nuevo-pedido">
              <Card className="border-gray-300 shadow-md bg-white">
                <CardHeader className="bg-gray-100 pt-8">
                  <CardTitle className="text-[#CA0007] flex items-center justify-center">
                    <Package className="w-6 h-6 mr-2" />
                    Realizar Nuevo Pedido
                  </CardTitle>
                  <CardDescription className="text-gray-600">Ingrese los detalles de su envío</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {!isLoggedIn ? (
                    <div className="text-center space-y-4">
                      <p className="text-gray-700">Para realizar un pedido, por favor inicie sesión o regístrese.</p>
                      <Button onClick={() => setActiveTab('cuenta')} className="w-auto px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200">
                        Ir a Mi Cuenta
                      </Button>
                    </div>
                  ) : !pedidoRealizado ? (
                    <form className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="origen" className="text-gray-700 flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Origen
                          </Label>
                          <Input id="origen" placeholder="Ciudad de origen"
                                 value={pedido.origen}
                                 onChange={(e) => setPedido({...pedido, origen: e.target.value})}
                                 className="bg-white text-gray-700 border-gray-300" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="destino" className="text-gray-700 flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Destino
                          </Label>
                          <Input id="destino" placeholder="Ciudad de destino"
                                 value={pedido.destino}
                                 onChange={(e) => setPedido({...pedido, destino: e.target.value})}
                                 className="bg-white text-gray-700 border-gray-300" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="peso" className="text-gray-700 flex items-center">
                            <Package className="w-4 h-4 mr-2" />
                            Peso (kg)
                          </Label>
                          <Input id="peso" type="number" placeholder="Peso del paquete"
                                 value={pedido.peso}
                                 onChange={(e) => setPedido({...pedido, peso: e.target.value})}
                                 className="bg-white text-gray-700 border-gray-300" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tipo-envio" className="text-gray-700 flex items-center">
                            <Truck className="w-4 h-4 mr-2" />
                            Tipo de Envío
                          </Label>
                          <Select onValueChange={(value) => setPedido({...pedido, tipoEnvio: value})}>
                            <SelectTrigger id="tipo-envio" className="bg-white text-gray-700 border-gray-300">
                              <SelectValue placeholder="Seleccione tipo de envío" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="express">Express</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="metodo-pago" className="text-gray-700 flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Método de Pago
                        </Label>
                        <Select onValueChange={setSelectedPaymentMethod} value={selectedPaymentMethod}>
                          <SelectTrigger id="metodo-pago" className="bg-white text-gray-700 border-gray-300">
                            <SelectValue placeholder="Seleccione método de pago" />
                          </SelectTrigger>
                          <SelectContent>
                            {metodosPago.map(metodo => (
                              <SelectItem key={metodo.id} value={metodo.tipo}>
                                {metodo.tipo} {metodo.numero}
                              </SelectItem>
                            ))}
                            <SelectItem value="efectivo">Pago en efectivo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {descuentoActivo && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                          role="alert"
                        >
                          <strong className="font-bold">Descuento Aplicado: </strong>
                          <span className="block sm:inline">
                            {descuentoActivo.nombre} - {descuentoActivo.porcentaje}% de descuento
                          </span>
                          {!costoCalculado && (
                            <p className="mt-2">El descuento será aplicado al momento de calcular el costo.</p>
                          )}
                          {costoCalculado && (
                            <p className="mt-2">Nuevo costo total: ${costo.toFixed(2)}</p>
                          )}
                        </motion.div>
                      )}

                      <div className="flex space-x-4">
                        <Button 
                          type="button" 
                          onClick={calcularCosto} 
                          className="w-auto px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200 flex items-center"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Calcular Costo
                        </Button>
                        <motion.div whileHover={{ scale: costoCalculado ? 1.05 : 1 }} whileTap={{ scale: costoCalculado ? 0.95 : 1 }}>
                          <Button 
                            type="button" 
                            onClick={realizarPedido} 
                            className="w-auto px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200 flex items-center" 
                            disabled={!costoCalculado || !selectedPaymentMethod}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Realizar Pedido
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-4"
                    >
                      <p className="text-green-600 text-xl">¡Pedido realizado con éxito!</p>
                      <p className="text-gray-700">Número de seguimiento: {trackingId}</p>
                      <Button onClick={reiniciarFormulario} className="w-auto px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200">
                        Realizar nuevo envío
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
                <CardFooter>
                  {!pedidoRealizado && costo > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="w-full text-center"
                    >
                      <p className="text-lg text-gray-700">Costo Total: ${costo.toFixed(2)}</p>
                      {descuentoActivo && (
                        <Badge variant="secondary" className="bg-[#CA0007] text-white">Descuento aplicado: {descuentoActivo.porcentaje}%</Badge>
                      )}
                    </motion.div>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="seguimiento">
              <Card className="border-gray-300 shadow-md bg-white">
                <CardHeader className="bg-gray-100 pt-8">
                  <CardTitle className="text-[#CA0007] flex items-center justify-center">
                    <Truck className="w-6 h-6 mr-2" />
                    Seguimiento de Pedidos
                  </CardTitle>
                  <CardDescription className="text-gray-600">Historial de sus envíos</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {pedidos.length === 0 ? (
                      <p className="text-gray-600 text-center">No hay pedidos realizados aún.</p>
                    ) : (
                      pedidos.map((pedido) => (
                        <PedidoCard key={pedido.id} pedido={pedido} />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cuenta">
              <Card className="border-gray-300 shadow-md bg-white">
                <CardHeader className="bg-gray-100 pt-8">
                  <CardTitle className="text-[#CA0007] flex items-center justify-center">
                    <User className="w-6 h-6 mr-2" />
                    Mi Cuenta
                  </CardTitle>
                  <CardDescription className="text-gray-600">Gestione su cuenta, descuentos y pagos</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {!isLoggedIn ? (
                    <Tabs value={activeAccountTab} onValueChange={setActiveAccountTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg overflow-hidden">
                        <TabsTrigger value="login" className="data-[state=active]:bg-[#CA0007] data-[state=active]:text-white text-gray-700 transition-all duration-200">
                          <LogIn className="w-4 h-4 mr-2" />
                          Iniciar Sesión
                        </TabsTrigger>
                        <TabsTrigger value="register" className="data-[state=active]:bg-[#CA0007] data-[state=active]:text-white text-gray-700 transition-all duration-200">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Registrarse
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700">Correo Electrónico</Label>
                            <Input id="email" type="email" placeholder="correo@ejemplo.com" required className="bg-white text-gray-700 border-gray-300" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                            <Input id="password" type="password" placeholder="********" required className="bg-white text-gray-700 border-gray-300" />
                          </div>
                          <Button type="submit" className="w-auto px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200">Iniciar Sesión</Button>
                        </form>
                      </TabsContent>
                      <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="register-name" className="text-gray-700">Nombre Completo</Label>
                            <Input id="register-name" placeholder="Juan Pérez" required className="bg-white text-gray-700 border-gray-300" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="register-email" className="text-gray-700">Correo Electrónico</Label>
                            <Input id="register-email" type="email" placeholder="correo@ejemplo.com" required className="bg-white text-gray-700 border-gray-300" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="register-password" className="text-gray-700">Contraseña</Label>
                            <Input id="register-password" type="password" placeholder="********" required className="bg-white text-gray-700 border-gray-300" />
                          </div>
                          <Button type="submit" className="w-auto px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200">Registrarse</Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="space-y-8">
                      {activeAccountSection === '' ?
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              onClick={() => setActiveAccountSection('descuentos')} 
                              className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-all hover:shadow-md"
                            >
                              <Percent className="w-12 h-12 mb-4" />
                              <span className="text-lg font-medium">Descuentos</span>
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              onClick={() => setActiveAccountSection('pagos')} 
                              className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-all hover:shadow-md"
                            >
                              <Wallet className="w-12 h-12 mb-4" />
                              <span className="text-lg font-medium">Métodos de Pago</span>
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              onClick={() => setActiveAccountSection('historial')} 
                              className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-all hover:shadow-md"
                            >
                              <ClipboardList className="w-12 h-12 mb-4" />
                              <span className="text-lg font-medium">Historial de Pedidos</span>
                            </Button>
                          </motion.div>
                        </div>
                      : (
                        <div>
                          <Button 
                            onClick={() => setActiveAccountSection('')} 
                            className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                          </Button>
                          {activeAccountSection === 'descuentos' && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <h3 className="text-lg font-medium text-gray-700 mb-4">Descuentos Disponibles</h3>
                              <div className="space-y-4">
                                {descuentos.map(descuento => (
                                  <DescuentoCard 
                                    key={descuento.id} 
                                    descuento={descuento} 
                                    onReclamar={reclamarDescuento}
                                    isActive={descuentoActivo?.id === descuento.id}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                          {activeAccountSection === 'pagos' && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <h3 className="text-lg font-medium text-gray-700 mb-4">Métodos de Pago</h3>
                              <div className="space-y-4">
                                {metodosPago.map(metodo => (
                                  <Card key={metodo.id} className="border-gray-300 bg-gray-100">
                                    <CardContent className="flex justify-between items-center p-4">
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">{metodo.tipo}</p>
                                        <p className="text-xs text-gray-500">{metodo.numero}</p>
                                      </div>
                                      <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-200 transition-colors duration-200">
                                        Editar
                                      </Button>
                                    </CardContent>
                                  </Card>
                                ))}
                                {!showNewCardForm ? (
                                  <Button 
                                    onClick={() => setShowNewCardForm(true)} 
                                    className="w-full px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200"
                                  >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Agregar Nueva Tarjeta
                                  </Button>
                                ) : (
                                  <Card className="border-gray-300 bg-gray-100">
                                    <CardContent>
                                      <form onSubmit={handleAddNewCard} className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="card-number" className="text-gray-700">Número de Tarjeta</Label>
                                          <Input 
                                            id="card-number" 
                                            placeholder="1234 5678 9012 3456" 
                                            value={newCard.numero}
                                            onChange={(e) => setNewCard({...newCard, numero: e.target.value})}
                                            className="bg-white text-gray-700 border-gray-300" 
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="card-holder" className="text-gray-700">Titular de la Tarjeta</Label>
                                          <Input 
                                            id="card-holder" 
                                            placeholder="Juan Pérez" 
                                            value={newCard.titular}
                                            onChange={(e) => setNewCard({...newCard, titular: e.target.value})}
                                            className="bg-white text-gray-700 border-gray-300" 
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="expiry-date" className="text-gray-700">Fecha de Vencimiento</Label>
                                            <Input 
                                              id="expiry-date" 
                                              placeholder="MM/AA" 
                                              value={newCard.fechaVencimiento}
                                              onChange={(e) => setNewCard({...newCard, fechaVencimiento: e.target.value})}
                                              className="bg-white text-gray-700 border-gray-300" 
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="cvv" className="text-gray-700">CVV</Label>
                                            <Input 
                                              id="cvv" 
                                              placeholder="123" 
                                              value={newCard.cvv}
                                              onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                                              className="bg-white text-gray-700 border-gray-300" 
                                            />
                                          </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <Button 
                                            type="button" 
                                            onClick={() => setShowNewCardForm(false)}
                                            variant="outline" 
                                            className="px-4 py-2 text-gray-600 border-gray-300 hover:bg-gray-200 transition-colors duration-200"
                                          >
                                            Cancelar
                                          </Button>
                                          <Button 
                                            type="submit"
                                            className="px-4 py-2 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200"
                                          >
                                            Agregar Tarjeta
                                          </Button>
                                        </div>
                                      </form>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            </motion.div>
                          )}
                          {activeAccountSection === 'historial' && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <h3 className="text-lg font-medium text-gray-700 mb-4">Historial de Pedidos</h3>
                              <div className="space-y-4">
                                {pedidos.map((pedido) => (
                                  <PedidoCard key={pedido.id} pedido={pedido} />
                                ))}
                                {pedidos.length === 0 && (
                                  <p className="text-gray-600 text-center">No hay pedidos realizados aún.</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  )
}