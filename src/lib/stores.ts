import { create } from "zustand";
import type { Profile } from "@/types";

// =============================================================================
// Auth Store
// =============================================================================

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// =============================================================================
// UI Store
// =============================================================================

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  closeMobileMenu: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
}));

// =============================================================================
// Deck Builder Store
// =============================================================================

interface DeckEntry {
  cardId: string;
  quantity: number;
}

interface DeckBuilderState {
  deckName: string;
  deckType: "combatants" | "strategy";
  cards: DeckEntry[];
  crownedId: string | null;
  setDeckName: (name: string) => void;
  setDeckType: (type: "combatants" | "strategy") => void;
  addCard: (cardId: string) => void;
  removeCard: (cardId: string) => void;
  setCrowned: (cardId: string | null) => void;
  reset: () => void;
  totalCards: () => number;
  isValid: () => boolean;
}

const COMBATANTS_MAX = 33; // tropas (sin contar el coronado)
const STRATEGY_MAX = 30;

// Mazo combatientes: 1 copia por carta (selección libre)
const COMBATANTS_MAX_COPIES = 1;
// Mazo estrategia: máx 2 cartas con el mismo nombre (realeza siempre 1)
const STRATEGY_MAX_COPIES = 2;

export const useDeckBuilderStore = create<DeckBuilderState>((set, get) => ({
  deckName: "",
  deckType: "combatants",
  cards: [],
  crownedId: null,

  setDeckName: (deckName) => set({ deckName }),

  setDeckType: (deckType) => set({ deckType, cards: [], crownedId: null }),

  addCard: (cardId) =>
    set((state) => {
      const max = state.deckType === "combatants" ? COMBATANTS_MAX : STRATEGY_MAX;
      const maxCopies =
        state.deckType === "combatants" ? COMBATANTS_MAX_COPIES : STRATEGY_MAX_COPIES;
      const total = state.cards.reduce((s, e) => s + e.quantity, 0);
      if (total >= max) return state;

      const existing = state.cards.find((e) => e.cardId === cardId);
      if (existing) {
        if (existing.quantity >= maxCopies) return state;
        return {
          cards: state.cards.map((e) =>
            e.cardId === cardId ? { ...e, quantity: e.quantity + 1 } : e
          ),
        };
      }
      return { cards: [...state.cards, { cardId, quantity: 1 }] };
    }),

  removeCard: (cardId) =>
    set((state) => {
      const existing = state.cards.find((e) => e.cardId === cardId);
      if (!existing) return state;
      if (existing.quantity <= 1) {
        return {
          cards: state.cards.filter((e) => e.cardId !== cardId),
          crownedId: state.crownedId === cardId ? null : state.crownedId,
        };
      }
      return {
        cards: state.cards.map((e) =>
          e.cardId === cardId ? { ...e, quantity: e.quantity - 1 } : e
        ),
      };
    }),

  setCrowned: (crownedId) => set({ crownedId }),

  reset: () => set({ deckName: "", deckType: "combatants", cards: [], crownedId: null }),

  totalCards: () => get().cards.reduce((s, e) => s + e.quantity, 0),

  isValid: () => {
    const state = get();
    const total = state.cards.reduce((s, e) => s + e.quantity, 0);
    if (state.deckType === "combatants") {
      return total === COMBATANTS_MAX && state.crownedId !== null;
    }
    return total === STRATEGY_MAX;
  },
}));

// =============================================================================
// Notification Store
// =============================================================================

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  clearUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  decrementUnread: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  clearUnread: () => set({ unreadCount: 0 }),
}));

// =============================================================================
// Cart Store — Carrito local con persistencia en localStorage
// =============================================================================

export interface CartItem {
  /** ID de variante de Tiendanube */
  variantId: number | string;
  /** ID del producto TN (para el link de imagen/nombre) */
  productId: number | string;
  /** Nombre legible */
  name: string;
  /** Acabado / Condición */
  subtitle?: string;
  /** URL de imagen */
  imageUrl?: string;
  /** Precio unitario en ARS (sin centavos) */
  price: number;
  /** Cantidad */
  quantity: number;
  /** Stock máximo disponible */
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: number | string) => void;
  updateQuantity: (variantId: number | string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  /** Genera la URL de checkout de Tiendanube con todos los items */
  checkoutUrl: () => string;
}

function buildCheckoutUrl(items: CartItem[]): string {
  const domain = process.env.NEXT_PUBLIC_TN_STORE_DOMAIN ?? "";
  if (!domain || items.length === 0) return "#";
  const base = domain.startsWith("http")
    ? domain
    : `https://${domain}`;
  // Tiendanube acepta múltiples productos en el carrito via:
  // /carrito/agregar?add_to_cart[{variantId}]={qty}&add_to_cart[{variantId2}]={qty2}
  const params = items
    .map((i) => `add_to_cart[${i.variantId}]=${i.quantity}`)
    .join("&");
  return `${base}/carrito/agregar?${params}`;
}

export const useCartStore = create<CartState>()(
  (set, get) => ({
    items: [],
    isOpen: false,

    addItem: (item) =>
      set((state) => {
        const existing = state.items.find((i) => i.variantId === item.variantId);
        const qty = item.quantity ?? 1;
        if (existing) {
          const newQty = Math.min(existing.quantity + qty, existing.maxStock);
          return {
            items: state.items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: newQty } : i
            ),
            isOpen: true,
          };
        }
        return {
          items: [...state.items, { ...item, quantity: Math.min(qty, item.maxStock) }],
          isOpen: true,
        };
      }),

    removeItem: (variantId) =>
      set((state) => ({
        items: state.items.filter((i) => i.variantId !== variantId),
      })),

    updateQuantity: (variantId, quantity) =>
      set((state) => ({
        items: state.items.map((i) =>
          i.variantId === variantId
            ? { ...i, quantity: Math.min(Math.max(1, quantity), i.maxStock) }
            : i
        ),
      })),

    clearCart: () => set({ items: [] }),
    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),

    totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    checkoutUrl: () => buildCheckoutUrl(get().items),
  })
);

