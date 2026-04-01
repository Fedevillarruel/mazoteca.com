"use client";

import { useEffect, useRef } from "react";
import { X, Minus, Plus, Trash2, ShoppingCart, ExternalLink, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice, checkoutUrl, clearCart } =
    useCartStore();

  const overlayRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const count = totalItems();
  const total = totalPrice();
  const url = checkoutUrl();

  return (
    <>
      {/* ── Overlay ── */}
      <div
        ref={overlayRef}
        onClick={closeCart}
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* ── Panel ── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-sm flex flex-col",
          "bg-surface-950 border-l border-surface-800 shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-800 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary-400" />
            <h2 className="text-base font-semibold text-surface-50">
              Carrito
              {count > 0 && (
                <span className="ml-2 text-sm font-normal text-surface-400">
                  ({count} {count === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="h-16 w-16 rounded-full bg-surface-900 border border-surface-800 flex items-center justify-center">
                <ShoppingBag className="h-7 w-7 text-surface-600" />
              </div>
              <div>
                <p className="font-medium text-surface-300">Tu carrito está vacío</p>
                <p className="text-sm text-surface-500 mt-1">
                  Agregá singles desde el catálogo o la tienda.
                </p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-3 bg-surface-900 border border-surface-800 rounded-xl p-3"
              >
                {/* Imagen */}
                <div className="h-16 w-11 rounded-lg bg-surface-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-surface-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <p className="text-xs font-semibold text-surface-100 leading-tight line-clamp-2">
                    {item.name}
                  </p>
                  {item.subtitle && (
                    <p className="text-[10px] text-surface-500">{item.subtitle}</p>
                  )}
                  <p className="text-sm font-bold text-primary-400">
                    {formatARS(item.price * item.quantity)}
                  </p>

                  {/* Cantidad */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-6 w-6 rounded bg-surface-800 hover:bg-surface-700 disabled:opacity-40 flex items-center justify-center transition-colors"
                      aria-label="Restar cantidad"
                    >
                      <Minus className="h-3 w-3 text-surface-300" />
                    </button>
                    <span className="text-sm font-semibold text-surface-100 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="h-6 w-6 rounded bg-surface-800 hover:bg-surface-700 disabled:opacity-40 flex items-center justify-center transition-colors"
                      aria-label="Sumar cantidad"
                    >
                      <Plus className="h-3 w-3 text-surface-300" />
                    </button>
                    <span className="text-[10px] text-surface-600 ml-1">
                      /{item.maxStock} máx
                    </span>
                  </div>
                </div>

                {/* Eliminar */}
                <button
                  onClick={() => removeItem(item.variantId)}
                  className="self-start p-1.5 text-surface-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
                  aria-label={`Eliminar ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer con total + checkout */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-surface-800 px-5 py-5 space-y-4 bg-surface-950">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-400">Subtotal ({count} {count === 1 ? "item" : "items"})</span>
              <span className="text-lg font-bold text-surface-50">{formatARS(total)}</span>
            </div>

            <p className="text-xs text-surface-500 -mt-2">
              Envío e impuestos se calculan en el checkout.
            </p>

            {/* Botón checkout */}
            <button
              onClick={() => {
                if (!url || url === "#") return;
                closeCart();
                // Pequeño delay para que el drawer cierre antes de navegar
                setTimeout(() => { window.location.href = url; }, 50);
              }}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-primary-600/30"
            >
              <ExternalLink className="h-4 w-4" />
              Ir al checkout
            </button>

            {/* Vaciar carrito */}
            <button
              onClick={clearCart}
              className="w-full text-xs text-surface-500 hover:text-red-400 transition-colors py-1"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
