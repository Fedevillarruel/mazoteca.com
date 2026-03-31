/** Etiquetas legibles para los estados de pedidos TiendaNube */
export function getStatusLabel(status: string | null): {
  label: string;
  color: string;
} {
  switch (status) {
    // payment_status
    case "paid":
      return { label: "Pagado", color: "text-green-400 bg-green-400/10 border-green-400/20" };
    case "pending":
      return { label: "Pendiente de pago", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" };
    case "authorized":
      return { label: "Autorizado", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" };
    case "voided":
      return { label: "Anulado", color: "text-surface-400 bg-surface-700/30 border-surface-600/20" };
    case "refunded":
      return { label: "Reembolsado", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" };
    case "unpaid":
      return { label: "Sin pagar", color: "text-red-400 bg-red-400/10 border-red-400/20" };
    case "charged_back":
      return { label: "Contracargo", color: "text-red-400 bg-red-400/10 border-red-400/20" };
    // shipping_status
    case "unshipped":
      return { label: "Sin enviar", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" };
    case "unpacked":
      return { label: "Sin empaquetar", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" };
    case "fulfilled":
      return { label: "Enviado", color: "text-green-400 bg-green-400/10 border-green-400/20" };
    case "unfulfilled":
      return { label: "Sin cumplir", color: "text-red-400 bg-red-400/10 border-red-400/20" };
    // order status
    case "open":
      return { label: "Abierto", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" };
    case "closed":
      return { label: "Completado", color: "text-green-400 bg-green-400/10 border-green-400/20" };
    case "cancelled":
      return { label: "Cancelado", color: "text-red-400 bg-red-400/10 border-red-400/20" };
    default:
      return { label: status ?? "—", color: "text-surface-400 bg-surface-700/30 border-surface-600/20" };
  }
}
