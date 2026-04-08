import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Truck,
  CreditCard,
  ExternalLink,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth";
import { getMyOrders } from "@/lib/actions/orders";
import type { TnOrder } from "@/lib/types/actions";
import { getStatusLabel } from "@/lib/utils/order-labels";

export const metadata: Metadata = {
  title: "Mis Pedidos",
  description: "Seguí el estado de tus compras de singles.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?redirect=/orders");

  const orders = await getMyOrders();

  return (
    <PageLayout
      title="Mis Pedidos"
      description="Seguimiento de tus compras de singles"
      showAds={false}
    >
      {orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}

function EmptyOrders() {
  return (
    <div className="text-center py-20">
      <ShoppingBag className="h-14 w-14 text-surface-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-surface-200 mb-2">
        No tenés pedidos todavía
      </h3>
      <p className="text-sm text-surface-400 max-w-sm mx-auto mb-6">
        Cuando comprés singles desde la tienda, tus pedidos aparecerán acá para
        que puedas hacer seguimiento.
      </p>
      <Link
        href="/singles"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors"
      >
        <ShoppingBag className="h-4 w-4" />
        Ver singles disponibles
      </Link>
    </div>
  );
}

function OrderCard({ order }: { order: TnOrder }) {
  const paymentBadge = getStatusLabel(order.payment_status);
  const shippingBadge = getStatusLabel(order.shipping_status);

  const orderDate = order.tn_created_at
    ? new Date(order.tn_created_at).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const itemCount = order.line_items?.length ?? 0;
  const hasTracking = !!order.tracking_number;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-surface-500 mb-0.5">Pedido #{order.id}</p>
            <CardTitle className="text-base">{orderDate}</CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Payment status */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${paymentBadge.color}`}
            >
              <CreditCard className="h-3 w-3" />
              {paymentBadge.label}
            </span>
            {/* Shipping status */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${shippingBadge.color}`}
            >
              <Truck className="h-3 w-3" />
              {shippingBadge.label}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Line items */}
        <div className="divide-y divide-surface-800 rounded-xl border border-surface-800 overflow-hidden">
          {order.line_items?.slice(0, 4).map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 bg-surface-900/40"
            >
              <Package className="h-5 w-5 text-surface-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-100 truncate">
                  {item.name}
                </p>
                {item.sku && (
                  <p className="text-xs text-surface-500 font-mono">{item.sku}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-white">
                  ${parseFloat(item.price).toLocaleString("es-AR")}
                </p>
                <p className="text-xs text-surface-500">x{item.quantity}</p>
              </div>
            </div>
          ))}
          {itemCount > 4 && (
            <div className="px-4 py-2 text-xs text-surface-500 bg-surface-900/20">
              + {itemCount - 4} ítem{itemCount - 4 !== 1 ? "s" : ""} más
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="flex items-center justify-between text-sm border-t border-surface-800 pt-3">
          <div className="space-y-0.5 text-surface-400 text-xs">
            {order.shipping_cost != null && order.shipping_cost > 0 && (
              <p>
                Envío:{" "}
                <span className="text-surface-300">
                  ${order.shipping_cost.toLocaleString("es-AR")}
                </span>
              </p>
            )}
            {order.discount != null && order.discount > 0 && (
              <p>
                Descuento:{" "}
                <span className="text-green-400">
                  −${order.discount.toLocaleString("es-AR")}
                </span>
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-surface-500">Total</p>
            <p className="text-2xl font-extrabold text-white">
              ${(order.total ?? 0).toLocaleString("es-AR")}{" "}
              <span className="text-sm font-normal text-surface-400">
                {order.currency}
              </span>
            </p>
          </div>
        </div>

        {/* Tracking */}
        {hasTracking && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700">
            <Truck className="h-5 w-5 text-primary-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-surface-400 mb-0.5">Número de seguimiento</p>
              <p className="text-sm font-mono font-medium text-surface-100">
                {order.tracking_number}
              </p>
            </div>
            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 font-medium shrink-0"
              >
                Rastrear
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {/* Shipping address */}
        {order.shipping_address && (
          <div className="text-xs text-surface-400 flex items-start gap-1.5">
            <Truck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-surface-500" />
            <span>
              {[
                order.shipping_address.address,
                order.shipping_address.city,
                order.shipping_address.province,
                order.shipping_address.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Detail page link ─────────────────────────────────────────

export function OrderDetailLink({ orderId }: { orderId: number }) {
  return (
    <Link
      href={`/orders/${orderId}`}
      className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
    >
      Ver detalle <ChevronRight className="h-3 w-3" />
    </Link>
  );
}
