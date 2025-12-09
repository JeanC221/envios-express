import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthFormProps {
  type: "login" | "register"
  onSubmit: (e: React.FormEvent) => void
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {type === "register" && (
      <div className="space-y-2">
        <Label htmlFor="register-name" className="text-gray-700">Nombre Completo</Label>
        <Input id="register-name" placeholder="Juan Pérez" required className="bg-white text-gray-700 border-gray-300" />
      </div>
    )}
    <div className="space-y-2">
      <Label htmlFor={`${type}-email`} className="text-gray-700">Correo Electrónico</Label>
      <Input id={`${type}-email`} type="email" placeholder="correo@ejemplo.com" required className="bg-white text-gray-700 border-gray-300" />
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${type}-password`} className="text-gray-700">Contraseña</Label>
      <Input id={`${type}-password`} type="password" placeholder="********" required className="bg-white text-gray-700 border-gray-300" />
    </div>
    <Button type="submit" className="w-auto px-6 bg-[#CA0007] hover:bg-[#A80006] text-white transition-colors duration-200">
      {type === "login" ? "Iniciar Sesión" : "Registrarse"}
    </Button>
  </form>
)

export default AuthForm