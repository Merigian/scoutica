import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Indirizzo email non valido"),
  password: z.string().min(8, "La password deve contenere almeno 8 caratteri"),
});

// Legacy schema — still used by registerStudio
export const registerSchema = z.object({
  firstName: z.string().min(2, "Il nome deve contenere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri"),
  email: z.string().email("Indirizzo email non valido"),
  password: z
    .string()
    .min(8, "La password deve contenere almeno 8 caratteri")
    .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/[0-9]/, "La password deve contenere almeno un numero"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

// ─── NEW Model Registration Schema ─────────────────────────────────
export const registerModelSchema = z.object({
  email: z.string().email("Indirizzo email non valido"),
  password: z
    .string()
    .min(8, "La password deve contenere almeno 8 caratteri")
    .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/[0-9]/, "La password deve contenere almeno un numero"),
  dateOfBirth: z.string().min(1, "La data di nascita è obbligatoria"),
  ageConfirmation: z.literal(true, {
    error: "Devi confermare di avere almeno 18 anni",
  }),
  termsAccepted: z.literal(true, {
    error: "Devi accettare i Termini di servizio e la Privacy Policy",
  }),
});

// ─── NEW Scout Registration Schema ─────────────────────────────────
export const registerScoutSchema = z.object({
  email: z.string().email("Indirizzo email non valido"),
  password: z
    .string()
    .min(8, "La password deve contenere almeno 8 caratteri")
    .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/[0-9]/, "La password deve contenere almeno un numero"),
  subtype: z.enum(["SCOUT", "AGENCY", "BRAND"]),
  termsAccepted: z.literal(true, {
    error: "Devi accettare i Termini di servizio e la Privacy Policy",
  }),
});

export const registerStudioSchema = registerSchema.extend({
  businessName: z.string().min(2, "Il nome dell'attività deve contenere almeno 2 caratteri"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterModelInput = z.infer<typeof registerModelSchema>;
export type RegisterScoutInput = z.infer<typeof registerScoutSchema>;
export type RegisterStudioInput = z.infer<typeof registerStudioSchema>;
