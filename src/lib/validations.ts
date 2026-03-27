import { z } from "zod";

// ---- Auth ----

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    username: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .max(20, "Máximo 20 caracteres")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Solo letras, números, guiones y guiones bajos"
      ),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// ---- Profile ----

export const profileSchema = z.object({
  display_name: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .nullable()
    .optional(),
  bio: z.string().max(500, "Máximo 500 caracteres").nullable().optional(),
  location: z.string().max(100, "Máximo 100 caracteres").nullable().optional(),
  website: z.string().url("URL inválida").nullable().optional().or(z.literal("")),
  digital_collection_visibility: z.enum(["public", "friends_only", "private"]),
  physical_collection_visibility: z.enum(["public", "friends_only", "private"]),
  decks_visibility: z.enum(["public", "friends_only", "private"]),
});

// ---- Deck ----

export const deckSchema = z.object({
  name: z
    .string()
    .min(1, "Nombre requerido")
    .max(100, "Máximo 100 caracteres"),
  description: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  deck_type: z.enum(["strategy", "combatants"]),
  is_public: z.boolean(),
  tags: z.array(z.string().max(30)).max(5, "Máximo 5 etiquetas"),
  notes: z.string().max(2000, "Máximo 2000 caracteres").optional(),
});

// ---- Marketplace ----

export const listingSchema = z.object({
  card_id: z.string().uuid("Carta inválida"),
  variant_id: z.string().uuid().nullable().optional(),
  listing_type: z.enum(["fixed_price", "accepting_offers"]),
  price: z.number().min(0, "Precio inválido").nullable().optional(),
  quantity: z.number().int().min(1, "Mínimo 1 unidad").max(99),
  condition: z.enum([
    "mint",
    "near_mint",
    "excellent",
    "good",
    "played",
    "poor",
  ]),
  description: z.string().max(2000, "Máximo 2000 caracteres").optional(),
});

export const offerSchema = z.object({
  amount: z.number().min(1, "Oferta mínima de $1"),
  message: z.string().max(500, "Máximo 500 caracteres").optional(),
});

// ---- Trade ----

export const tradeProposalSchema = z.object({
  receiver_id: z.string().uuid(),
  proposer_items: z
    .array(
      z.object({
        card_id: z.string().uuid(),
        variant_id: z.string().uuid().nullable().optional(),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1, "Debés ofrecer al menos una carta"),
  requested_items: z
    .array(
      z.object({
        card_id: z.string().uuid(),
        variant_id: z.string().uuid().nullable().optional(),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1, "Debés pedir al menos una carta"),
  message: z.string().max(500, "Máximo 500 caracteres").optional(),
});

// ---- Forum ----

export const threadSchema = z.object({
  category_id: z.string().uuid("Categoría requerida"),
  title: z
    .string()
    .min(5, "Mínimo 5 caracteres")
    .max(200, "Máximo 200 caracteres"),
  content: z
    .string()
    .min(10, "Mínimo 10 caracteres")
    .max(10000, "Máximo 10000 caracteres"),
  tags: z.array(z.string().max(30)).max(5, "Máximo 5 etiquetas").optional(),
});

export const postSchema = z.object({
  content: z
    .string()
    .min(1, "Contenido requerido")
    .max(10000, "Máximo 10000 caracteres"),
});

// ---- Physical Inventory ----

export const physicalInventoryItemSchema = z.object({
  card_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1).max(999),
  condition: z.enum([
    "mint",
    "near_mint",
    "excellent",
    "good",
    "played",
    "poor",
  ]),
  notes: z.string().max(500).optional(),
  is_for_trade: z.boolean(),
  is_for_sale: z.boolean(),
});

// ---- Report ----

export const reportSchema = z.object({
  entity_type: z.enum(["listing", "trade", "thread", "post", "profile"]),
  entity_id: z.string().uuid(),
  reported_user_id: z.string().uuid().nullable().optional(),
  reason: z
    .string()
    .min(1, "Razón requerida")
    .max(100, "Máximo 100 caracteres"),
  details: z.string().max(2000, "Máximo 2000 caracteres").optional(),
});

// ---- Tournament ----

export const tournamentSchema = z.object({
  name: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(200, "Máximo 200 caracteres"),
  description: z.string().max(5000, "Máximo 5000 caracteres").optional(),
  format: z.enum([
    "swiss",
    "single_elimination",
    "double_elimination",
    "round_robin",
  ]),
  deck_type: z.enum(["strategy", "combatants"]).nullable().optional(),
  max_participants: z.number().int().min(4).max(512).nullable().optional(),
  starts_at: z.string().datetime(),
  registration_closes_at: z.string().datetime().nullable().optional(),
  rules: z.string().max(5000).optional(),
});

// ---- Type exports for forms ----

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type DeckFormData = z.infer<typeof deckSchema>;
export type ListingFormData = z.infer<typeof listingSchema>;
export type OfferFormData = z.infer<typeof offerSchema>;
export type TradeProposalFormData = z.infer<typeof tradeProposalSchema>;
export type ThreadFormData = z.infer<typeof threadSchema>;
export type PostFormData = z.infer<typeof postSchema>;
export type PhysicalInventoryFormData = z.infer<typeof physicalInventoryItemSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;
export type TournamentFormData = z.infer<typeof tournamentSchema>;
