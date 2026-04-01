// ============================================================
// DolarAPI — obtiene cotización del dólar blue
// https://dolarapi.com/docs/
// ============================================================

export interface DolarRate {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

/**
 * Obtiene la cotización del dólar blue (venta) desde dolarapi.com
 * En caso de error devuelve un fallback conservador.
 */
export async function getBlueDolarRate(): Promise<number> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: 600 }, // cache 10 minutos
    });
    if (!res.ok) throw new Error(`dolarapi error: ${res.status}`);
    const data: DolarRate = await res.json();
    return data.venta;
  } catch (err) {
    console.error("[DolarAPI] Error fetching blue rate:", err);
    // Fallback conservador: 1300 ARS por USD
    return 1300;
  }
}
