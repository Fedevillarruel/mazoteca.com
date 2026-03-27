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

const COMBATANTS_MAX = 33;
const STRATEGY_MAX = 30;

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
      const total = state.cards.reduce((s, e) => s + e.quantity, 0);
      if (total >= max) return state;

      const existing = state.cards.find((e) => e.cardId === cardId);
      if (existing) {
        if (existing.quantity >= 3) return state;
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
