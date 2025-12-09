'use client'

import { useState, useEffect, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CreditCard, User, Send, LogIn, UserPlus, Percent, Wallet, ClipboardList, ArrowLeft, PlusCircle, MapPin, DollarSign, Edit, Trash2 } from 'lucide-react'
import { PedidoCard } from "@/components/PedidoCard"
import { DescuentoCard } from "@/components/DescuentoCard"
import PedidosHistorial from "@/components/PedidosHistorial"
import type { Pedido, Descuento } from "@/lib/types"
import { calcularCostoPedido, generarTimelinePedido } from "@/lib/utils"

type MetodoPago = {
  id: number
  tipo: string
  numero: string
}

type AccountState = {
  isLoggedIn: boolean
  activeAccountTab: string
  activeAccountSection: string
  metodosPago: MetodoPago[]
  showNewCardForm: boolean
  newCard: { numero: string; titular: string; fechaVencimiento: string; cvv: string }
  editingCard: MetodoPago | null
}

// Wrapper para animaciones repetidas
function AnimatedSection({
  children,
  className = '',
  ...props
}: {
  children: ReactNode
  className?: string
  [key: string]: any
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default function EnviosExpress() {
  const [pedido, setPedido] = useState<{ origen: string; destino: string; peso: string; tipoEnvio: string }>({
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [descuentoActivo, setDescuentoActivo] = useState<Descuento | null>(null)
  const [descuentos, setDescuentos] = useState<Descuento[]>([
    { id: 1, nombre: "Descuento de bienvenida", descripcion: "10% en tu primer envío", porcentaje: 10, reclamado: false },
    { id: 2, nombre: "Descuento de verano", descripcion: "15% en envíos internacionales", porcentaje: 15, reclamado: false },
    { id: 3, nombre: "Descuento de fidelidad", descripcion: "5% en todos los envíos", porcentaje: 5, reclamado: false },
  ])

  // Estado agrupado para la cuenta
  const [accountState, setAccountState] = useState<AccountState>({
    isLoggedIn: false,
    activeAccountTab: 'login',
    activeAccountSection: '',
    metodosPago: [
      { id: 1, tipo: "Tarjeta de crédito", numero: "**** **** **** 1234" },
      { id: 2, tipo: "Efectivo", numero: "N/A" },
    ],
    showNewCardForm: false,
    newCard: { numero: '', titular: '', fechaVencimiento: '', cvv: '' },
    editingCard: null,
  })

  // Persistencia de descuento activo
  useEffect(() => {
    const saved = localStorage.getItem("descuentoActivo")
    if (saved) setDescuentoActivo(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (descuentoActivo) {
      localStorage.setItem("descuentoActivo", JSON.stringify(descuentoActivo))
    } else {
      localStorage.removeItem("descuentoActivo")
    }
  }, [descuentoActivo])

  useEffect(() => {
    if (activeTab === 'nuevo-pedido' && descuentoActivo && costoCalculado) {
      calcularCosto()
    }
  }, [activeTab, descuentoActivo])

  const calcularCosto = () => {
    const costo = calcularCostoPedido(pedido.peso, pedido.tipoEnvio, descuentoActivo)
    setCosto(costo)
    setCostoCalculado(true)
  }

  const realizarPedido = () => {
    if (costo > 0 && accountState.isLoggedIn && selectedPaymentMethod) {
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
        timeline: generarTimelinePedido(new Date(), [0, 1, 2, 3]), // parametrizable
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
        d.id === id ? { ...d, reclamado: true } : d
      ))
      setDescuentoActivo(descuentoReclamado)
      if (costoCalculado) {
        calcularCosto()
      }
    }
  }

  // Handlers de cuenta agrupados
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAccountState(prev => ({ ...prev, isLoggedIn: true }))
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setAccountState(prev => ({ ...prev, isLoggedIn: true }))
  }

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault()
    const newId = accountState.metodosPago.length + 1
    const newMetodoPago: MetodoPago = {
      id: newId,
      tipo: "Tarjeta de crédito",
      numero: `**** **** **** ${accountState.newCard.numero.slice(-4)}`
    }
    setAccountState(prev => ({
      ...prev,
      metodosPago: [...prev.metodosPago, newMetodoPago],
      showNewCardForm: false,
      newCard: { numero: '', titular: '', fechaVencimiento: '', cvv: '' }
    }))
  }

  const handleEditCard = (card: MetodoPago) => {
    setAccountState(prev => ({
      ...prev,
      editingCard: card,
      newCard: {
        numero: card.numero,
        titular: '',
        fechaVencimiento: '',
        cvv: ''
      },
      showNewCardForm: true
    }))
  }

  const handleUpdateCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (accountState.editingCard) {
      const updatedMetodosPago = accountState.metodosPago.map(metodo =>
        metodo.id === accountState.editingCard!.id
          ? { ...metodo, numero: `**** **** **** ${accountState.newCard.numero.slice(-4)}` }
          : metodo
      )
      setAccountState(prev => ({
        ...prev,
        metodosPago: updatedMetodosPago,
        showNewCardForm: false,
        editingCard: null,
        newCard: { numero: '', titular: '', fechaVencimiento: '', cvv: '' }
      }))
    }
  }

  const handleDeleteCard = (id: number) => {
    const updatedMetodosPago = accountState.metodosPago.filter(metodo => metodo.id !== id)
    setAccountState(prev => ({
      ...prev,
      metodosPago: updatedMetodosPago
    }))
  }

  // Validación de formulario de pedido
  const isPedidoFormValid = pedido.origen.trim() !== "" &&
    pedido.destino.trim() !== "" &&
    pedido.peso.trim() !== "" &&
    !isNaN(Number(pedido.peso)) &&
    Number(pedido.peso) > 0 &&
    pedido.tipoEnvio.trim() !== "" &&
    selectedPaymentMethod.trim() !== ""

  return (
    <div className="min-h-screen bg-white">
      {/* Banner fijo */}
      <div className="bg-[#CA0007] w-full h-24 flex items-center justify-center fixed top-0 left-0 z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-white flex items-center justify-center"
        >
          <Send className="w-10 h-10 mr-3 inline-block text-white" />
          EnviosYa
        </motion.h1>
      </div>

      {/* Contenido principal con padding-top para el banner */}
      <div className="container mx-auto p-4 pt-32">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg overflow-hidden" role="tablist">
            <TabsTrigger
              value="nuevo-pedido"
              className="data-[state=active]:bg-[#CA0007] data-[state=active]:text-white text-gray-700 transition-all duration-200 flex items-center justify-center"
              aria-label="Ir a la pestaña Nuevo Pedido"
              role="tab"
            >
              <Package className="w-4 h-4 mr-2" aria-hidden="true" />
              Nuevo Pedido
            </TabsTrigger>
            <TabsTrigger
              value="seguimiento"
              className="data-[state=active]:bg-[#CA0007] data-[state=active]:text-white text-gray-700 transition-all duration-200 flex items-center justify-center"
              aria-label="Ir a la pestaña Seguimiento"
              role="tab"
            >
              <Truck className="w-4 h-4 mr-2" aria-hidden="true" />
              Seguimiento
            </TabsTrigger>
            <TabsTrigger
              value="cuenta"
              className="data-[state=active]:bg-[#CA0007] data-[state=active]:text-white text-gray-700 transition-all duration-200 flex items-center justify-center"
              aria-label="Ir a la pestaña Mi Cuenta"
              role="tab"
            >
              <User className="w-4 h-4 mr-2" aria-hidden="true" />
              Mi Cuenta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nuevo-pedido" className="mt-6" role="tabpanel" aria-labelledby="tab-nuevo-pedido">
            <Card className="border-gray-300 shadow-md bg-white">
              <CardHeader className="bg-gray-100 pt-8">
                <CardTitle id="tab-nuevo-pedido" className="text-[#CA0007] flex items-center justify-center">
                  <Package className="w-6 h-6 mr-2" aria-hidden="true" />
                  Realizar Nuevo Pedido
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Ingrese los detalles de su envío
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!accountState.isLoggedIn ? (
                  <AnimatedSection className="text-center py-8" role="region" aria-label="Mensaje de inicio de sesión requerido">
                    <p className="text-gray-700">
                      Para realizar un pedido, por favor inicie sesión o regístrese en la sección "Mi Cuenta".
                    </p>
                  </AnimatedSection>
                ) : !pedidoRealizado ? (
                  <AnimatedSection className="space-y-6" role="form" aria-labelledby="tab-nuevo-pedido">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="origen" className="text-gray-700 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
                          Origen
                        </Label>
                        <Input
                          id="origen"
                          placeholder="Ciudad de origen"
                          value={pedido.origen}
                          onChange={(e) => setPedido({ ...pedido, origen: e.target.value })}
                          className="bg-white text-gray-700 border-gray-300"
                          aria-required="true"
                          aria-label="Ciudad de origen"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="destino" className="text-gray-700 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
                          Destino
                        </Label>
                        <Input
                          id="destino"
                          placeholder="Ciudad de destino"
                          value={pedido.destino}
                          onChange={(e) => setPedido({ ...pedido, destino: e.target.value })}
                          className="bg-white text-gray-700 border-gray-300"
                          aria-required="true"
                          aria-label="Ciudad de destino"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso" className="text-gray-700 flex items-center">
                          <Package className="w-4 h-4 mr-2" aria-hidden="true" />
                          Peso (kg)
                        </Label>
                        <Input
                          id="peso"
                          type="number"
                          placeholder="Peso del paquete"
                          value={pedido.peso}
                          onChange={(e) => setPedido({ ...pedido, peso: e.target.value })}
                          className="bg-white text-gray-700 border-gray-300"
                          aria-required="true"
                          aria-label="Peso del paquete en kilogramos"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipo-envio" className="text-gray-700 flex items-center">
                          <Truck className="w-4 h-4 mr-2" aria-hidden="true" />
                          Tipo de Envío
                        </Label>
                        <Select onValueChange={(value) => setPedido({ ...pedido, tipoEnvio: value })}>
                          <SelectTrigger id="tipo-envio" className="bg-white text-gray-700 border-gray-300" aria-label="Tipo de envío">
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
                        <CreditCard className="w-4 h-4 mr-2" aria-hidden="true" />
                        Método de Pago
                      </Label>
                      <Select onValueChange={setSelectedPaymentMethod} value={selectedPaymentMethod}>
                        <SelectTrigger id="metodo-pago" className="bg-white text-gray-700 border-gray-300" aria-label="Método de pago">
                          <SelectValue placeholder="Seleccione método de pago" />
                        </SelectTrigger>
                        <SelectContent>
                          {accountState.metodosPago.map(metodo => (
                            <SelectItem key={metodo.id} value={metodo.tipo}>
                              {metodo.tipo} {metodo.numero}
                            </SelectItem>
                          ))}
                          {!accountState.metodosPago.some(m => m.tipo.toLowerCase() === "efectivo") && (
                            <SelectItem value="efectivo">Pago en efectivo</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {descuentoActivo && (
                      <AnimatedSection className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="status" aria-live="polite">
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
                      </AnimatedSection>
                    )}

                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        onClick={calcularCosto}
                        className="w-auto px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200 flex items-center"
                        disabled={!isPedidoFormValid}
                        aria-label="Calcular costo del pedido"
                      >
                        <DollarSign className="w-4 h-4 mr-2" aria-hidden="true" />
                        Calcular Costo
                      </Button>
                      <motion.div whileHover={{ scale: costoCalculado ? 1.05 : 1 }} whileTap={{ scale: costoCalculado ? 0.95 : 1 }}>
                        <Button
                          type="button"
                          onClick={realizarPedido}
                          className="w-auto px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200 flex items-center"
                          disabled={!costoCalculado || !isPedidoFormValid}
                          aria-label="Realizar pedido"
                        >
                          <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                          Realizar Pedido
                        </Button>
                      </motion.div>
                    </div>
                  </AnimatedSection>
                ) : (
                  <AnimatedSection className="text-center py-8 space-y-4" role="status" aria-live="polite">
                    <p className="text-green-600 text-xl">¡Pedido realizado con éxito!</p>
                    <p className="text-gray-700">Número de seguimiento: {trackingId}</p>
                    <Button
                      onClick={reiniciarFormulario}
                      className="bg-[#CA0007] hover:bg-[#A80006] text-white"
                      aria-label="Realizar nuevo envío"
                    >
                      Realizar nuevo envío
                    </Button>
                  </AnimatedSection>
                )}
              </CardContent>
              <CardFooter>
                {!pedidoRealizado && costo > 0 && (
                  <AnimatedSection className="w-full text-center" role="status" aria-live="polite">
                    <p className="text-lg text-gray-700">Costo Total: ${costo.toFixed(2)}</p>
                    {descuentoActivo && (
                      <Badge variant="secondary" className="bg-[#CA0007] text-white">
                        Descuento aplicado: {descuentoActivo.porcentaje}%
                      </Badge>
                    )}
                  </AnimatedSection>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="seguimiento" role="tabpanel" aria-labelledby="tab-seguimiento">
            <Card className="border-gray-300 shadow-md bg-white">
              <CardHeader className="bg-gray-100 pt-8">
                <CardTitle id="tab-seguimiento" className="text-[#CA0007] flex items-center justify-center">
                  <Truck className="w-6 h-6 mr-2" aria-hidden="true" />
                  Seguimiento de Pedidos
                </CardTitle>
                <CardDescription className="text-gray-600">Historial de sus envíos</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <PedidosHistorial pedidos={pedidos} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cuenta" role="tabpanel" aria-labelledby="tab-cuenta">
            <Card className="border-gray-300 shadow-md bg-white">
              <CardHeader className="bg-gray-100 pt-8">
                <CardTitle id="tab-cuenta" className="text-[#CA0007] flex items-center justify-center">
                  <User className="w-6 h-6 mr-2" aria-hidden="true" />
                  Mi Cuenta
                </CardTitle>
                <CardDescription className="text-gray-600">Gestione su cuenta, descuentos y pagos</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!accountState.isLoggedIn ? (
                  <Tabs value={accountState.activeAccountTab} onValueChange={tab => setAccountState(prev => ({ ...prev, activeAccountTab: tab }))} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg overflow-hidden" role="tablist">
                      <TabsTrigger value="login" className="data-[state=active]:bg-[#CA0007] data-[state=active]:text-white text-gray-700 transition-all duration-200" aria-label="Ir a la pestaña Iniciar Sesión" role="tab">
                        <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
                        Iniciar Sesión
                      </TabsTrigger>
                      <TabsTrigger value="register" className="data-[state=active]:bg-[#CA0007] data-[state=active]:text-white text-gray-700 transition-all duration-200" aria-label="Ir a la pestaña Registrarse" role="tab">
                        <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
                        Registrarse
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" role="tabpanel" aria-labelledby="tab-login">
                      <form onSubmit={handleLogin} className="space-y-4" role="form" aria-labelledby="tab-login">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-700">Correo Electrónico</Label>
                          <Input id="email" type="email" placeholder="correo@ejemplo.com" required className="bg-white text-gray-700 border-gray-300" aria-required="true" aria-label="Correo Electrónico" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                          <Input id="password" type="password" placeholder="********" required className="bg-white text-gray-700 border-gray-300" aria-required="true" aria-label="Contraseña" />
                        </div>
                        <Button type="submit" className="w-auto px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200" aria-label="Iniciar Sesión">Iniciar Sesión</Button>
                      </form>
                    </TabsContent>
                    <TabsContent value="register" role="tabpanel" aria-labelledby="tab-register">
                      <form onSubmit={handleRegister} className="space-y-4" role="form" aria-labelledby="tab-register">
                        <div className="space-y-2">
                          <Label htmlFor="register-name" className="text-gray-700">Nombre Completo</Label>
                          <Input id="register-name" placeholder="Juan Pérez" required className="bg-white text-gray-700 border-gray-300" aria-required="true" aria-label="Nombre Completo" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-email" className="text-gray-700">Correo Electrónico</Label>
                          <Input id="register-email" type="email" placeholder="correo@ejemplo.com" required className="bg-white text-gray-700 border-gray-300" aria-required="true" aria-label="Correo Electrónico" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-password" className="text-gray-700">Contraseña</Label>
                          <Input id="register-password" type="password" placeholder="********" required className="bg-white text-gray-700 border-gray-300" aria-required="true" aria-label="Contraseña" />
                        </div>
                        <Button type="submit" className="w-auto px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200" aria-label="Registrarse">Registrarse</Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-8">
                    {accountState.activeAccountSection === '' ?
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => setAccountState(prev => ({ ...prev, activeAccountSection: 'descuentos' }))}
                            className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-all hover:shadow-md"
                            aria-label="Ver descuentos disponibles"
                          >
                            <Percent className="w-12 h-12 mb-4" aria-hidden="true" />
                            <span className="text-lg font-medium">Descuentos</span>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => setAccountState(prev => ({ ...prev, activeAccountSection: 'pagos' }))}
                            className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-all hover:shadow-md"
                            aria-label="Ver métodos de pago"
                          >
                            <Wallet className="w-12 h-12 mb-4" aria-hidden="true" />
                            <span className="text-lg font-medium">Métodos de Pago</span>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => setAccountState(prev => ({ ...prev, activeAccountSection: 'historial' }))}
                            className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-all hover:shadow-md"
                            aria-label="Ver historial de pedidos"
                          >
                            <ClipboardList className="w-12 h-12 mb-4" aria-hidden="true" />
                            <span className="text-lg font-medium">Historial de Pedidos</span>
                          </Button>
                        </motion.div>
                      </div>
                    : (
                      <div>
                        <Button
                          onClick={() => setAccountState(prev => ({ ...prev, activeAccountSection: '' }))}
                          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
                          aria-label="Volver a la sección principal de cuenta"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                          Volver
                        </Button>
                        {accountState.activeAccountSection === 'descuentos' && (
                          <AnimatedSection role="region" aria-label="Descuentos disponibles">
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
                          </AnimatedSection>
                        )}
                        {accountState.activeAccountSection === 'pagos' && (
                          <AnimatedSection role="region" aria-label="Métodos de pago">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Métodos de Pago</h3>
                            <div className="space-y-4">
                              {accountState.metodosPago.map(metodo => (
                                <Card key={metodo.id} className="border-gray-300 bg-gray-100">
                                  <CardContent className="flex justify-between items-center p-4">
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">{metodo.tipo}</p>
                                      <p className="text-xs text-gray-500">{metodo.numero}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-gray-600 border-gray-300 hover:bg-gray-200 transition-colors duration-200"
                                        onClick={() => handleEditCard(metodo)}
                                        aria-label={`Editar método de pago ${metodo.tipo} ${metodo.numero}`}
                                      >
                                        <Edit className="w-4 h-4" aria-hidden="true" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-300 hover:bg-red-100 transition-colors duration-200"
                                        onClick={() => handleDeleteCard(metodo.id)}
                                        aria-label={`Eliminar método de pago ${metodo.tipo} ${metodo.numero}`}
                                      >
                                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                              {!accountState.showNewCardForm ? (
                                <Button
                                  onClick={() => setAccountState(prev => ({ ...prev, showNewCardForm: true }))}
                                  className="w-full px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200"
                                  aria-label="Agregar nueva tarjeta"
                                >
                                  <PlusCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                                  Agregar Nueva Tarjeta
                                </Button>
                              ) : (
                                <Card className="border-gray-300 bg-gray-100">
                                  <CardContent>
                                    <form onSubmit={accountState.editingCard ? handleUpdateCard : handleAddNewCard} className="space-y-4 py-4" role="form" aria-label="Formulario de tarjeta">
                                      <div className="space-y-2">
                                        <Label htmlFor="card-number" className="text-gray-700">Número de Tarjeta</Label>
                                        <Input
                                          id="card-number"
                                          placeholder="1234 5678 9012 3456"
                                          value={accountState.newCard.numero}
                                          onChange={(e) => setAccountState(prev => ({ ...prev, newCard: { ...prev.newCard, numero: e.target.value } }))}
                                          className="bg-white text-gray-700 border-gray-300"
                                          aria-required="true"
                                          aria-label="Número de Tarjeta"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="card-holder" className="text-gray-700">Titular de la Tarjeta</Label>
                                        <Input
                                          id="card-holder"
                                          placeholder="Juan Pérez"
                                          value={accountState.newCard.titular}
                                          onChange={(e) => setAccountState(prev => ({ ...prev, newCard: { ...prev.newCard, titular: e.target.value } }))}
                                          className="bg-white text-gray-700 border-gray-300"
                                          aria-required="true"
                                          aria-label="Titular de la Tarjeta"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="expiry-date" className="text-gray-700">Fecha de Vencimiento</Label>
                                          <Input
                                            id="expiry-date"
                                            placeholder="MM/AA"
                                            value={accountState.newCard.fechaVencimiento}
                                            onChange={(e) => setAccountState(prev => ({ ...prev, newCard: { ...prev.newCard, fechaVencimiento: e.target.value } }))}
                                            className="bg-white text-gray-700 border-gray-300"
                                            aria-required="true"
                                            aria-label="Fecha de Vencimiento"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="cvv" className="text-gray-700">CVV</Label>
                                          <Input
                                            id="cvv"
                                            placeholder="123"
                                            value={accountState.newCard.cvv}
                                            onChange={(e) => setAccountState(prev => ({ ...prev, newCard: { ...prev.newCard, cvv: e.target.value } }))}
                                            className="bg-white text-gray-700 border-gray-300"
                                            aria-required="true"
                                            aria-label="CVV"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex justify-end space-x-2">
                                        <Button
                                          type="button"
                                          onClick={() => setAccountState(prev => ({
                                            ...prev,
                                            showNewCardForm: false,
                                            editingCard: null,
                                            newCard: { numero: '', titular: '', fechaVencimiento: '', cvv: '' }
                                          }))}
                                          variant="outline"
                                          className="px-4 py-2 text-gray-600 border-gray-300 hover:bg-gray-200 transition-colors duration-200"
                                          aria-label="Cancelar agregar o editar tarjeta"
                                        >
                                          Cancelar
                                        </Button>
                                        <Button
                                          type="submit"
                                          className="px-4 py-2 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200"
                                          aria-label={accountState.editingCard ? 'Actualizar Tarjeta' : 'Agregar Tarjeta'}
                                        >
                                          {accountState.editingCard ? 'Actualizar Tarjeta' : 'Agregar Tarjeta'}
                                        </Button>
                                      </div>
                                    </form>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </AnimatedSection>
                        )}
                        {accountState.activeAccountSection === 'historial' && (
                          <AnimatedSection role="region" aria-label="Historial de pedidos">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Historial de Pedidos</h3>
                            <PedidosHistorial pedidos={pedidos} />
                          </AnimatedSection>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}