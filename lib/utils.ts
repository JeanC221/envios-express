import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Descuento } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcularCostoPedido(
  peso: string,
  tipoEnvio: string,
  descuentoActivo: Descuento | null
): number {
  if (!peso || isNaN(Number(peso)) || Number(peso) <= 0) return 0;
  const costoBase = parseFloat(peso) * 10;
  const costoExpress = tipoEnvio === "express" ? costoBase * 0.5 : 0;
  const costoTotal = costoBase + costoExpress;
  const descuentoAplicado = descuentoActivo
    ? costoTotal * (descuentoActivo.porcentaje / 100)
    : 0;
  return costoTotal - descuentoAplicado;
}

export function generarTimelinePedido(
  fechaBase: Date = new Date(),
  dias: number[] = [0, 1, 2, 3]
) {
  const estados = ["Pedido realizado", "En preparación", "En tránsito", "Entregado"];
  return estados.map((estado, idx) => ({
    estado,
    fecha: new Date(
      fechaBase.getTime() + dias[idx] * 24 * 60 * 60 * 1000
    ).toLocaleDateString(),
  }));
}
