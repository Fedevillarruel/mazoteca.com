// ── App Settings types (NO "use server") ────────────────────
// Keep this file free of "use server" so it can be imported from
// anywhere: server components, client components, and server actions.

export interface AppSettings {
  singles_enabled: boolean;
  cart_enabled: boolean;
  prices_enabled: boolean;
  trades_enabled: boolean;
  forum_enabled: boolean;
  decks_enabled: boolean;
  album_enabled: boolean;
  premium_enabled: boolean;
}

export const SETTINGS_DEFAULTS: AppSettings = {
  singles_enabled: true,
  cart_enabled: false,
  prices_enabled: false,
  trades_enabled: true,
  forum_enabled: true,
  decks_enabled: true,
  album_enabled: true,
  premium_enabled: true,
};

export interface UpdateSettingResult {
  success: boolean;
  error?: string;
}
