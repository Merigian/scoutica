import { z } from "zod";

export const modelProfileSchema = z.object({
  firstName: z.string().min(2, "Il nome deve contenere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri"),
  bio: z.string().max(2000, "La bio non può superare 2000 caratteri").optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER"]).optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  height: z.coerce.number().min(100).max(250).optional().nullable(),
  bust: z.coerce.number().min(50).max(150).optional().nullable(),
  waist: z.coerce.number().min(40).max(120).optional().nullable(),
  hips: z.coerce.number().min(50).max(150).optional().nullable(),
  shoeSize: z.coerce.number().min(30).max(55).optional().nullable(),
  dressSize: z.string().optional().nullable(),
  eyeColor: z.enum(["BROWN", "BLUE", "GREEN", "HAZEL", "GRAY", "AMBER", "OTHER"]).optional().nullable(),
  hairColor: z.enum(["BLACK", "BROWN", "BLONDE", "RED", "AUBURN", "GRAY", "WHITE", "OTHER"]).optional().nullable(),
  ethnicity: z.enum(["CAUCASIAN", "AFRICAN", "ASIAN", "LATINO", "MIDDLE_EASTERN", "MIXED", "OTHER"]).optional().nullable(),
  categories: z.array(z.enum([
    "COMMERCIAL", "EDITORIAL", "RUNWAY", "BEAUTY", "FITTING", "SHOWROOM",
    "PLUS_SIZE", "PETITE", "FITNESS", "LINGERIE", "SWIMWEAR", "OTHER"
  ])).default([]),
  professionalStatus: z.enum(["NEW_FACE", "EXPERIENCED", "AGENCY_REPRESENTED", "FREELANCE"]).optional().nullable(),
  spokenLanguages: z.array(z.string()).default([]),
  travelAvailability: z.boolean().default(false),
  instagramUrl: z.string().optional().nullable().or(z.literal("")),
  tiktokUrl: z.string().optional().nullable().or(z.literal("")),
  youtubeUrl: z.string().optional().nullable().or(z.literal("")),
  xUrl: z.string().optional().nullable().or(z.literal("")),
  websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
  followerCount: z.coerce.number().min(0).optional().nullable(),
  visibility: z.enum(["PUBLIC", "VERIFIED_SCOUTS_ONLY", "PRIVATE"]).default("PUBLIC"),
});

export const scoutProfileSchema = z.object({
  businessName: z.string().min(2, "Il nome dell'attività deve contenere almeno 2 caratteri"),
  roleTitle: z.string().optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  city: z.string().optional().nullable(),
  professionalEmail: z.string().email("Email professionale non valida").optional().nullable(),
  websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
  socialProfileUrl: z.string().url().optional().nullable().or(z.literal("")),
  vatNumber: z.string().optional().nullable(),
});

export const verificationSchema = z.object({
  fullName: z.string().min(2, "Il nome completo è obbligatorio"),
  businessName: z.string().min(2, "Il nome dell'attività è obbligatorio"),
  roleTitle: z.string().optional().nullable(),
  city: z.string().min(1, "La città è obbligatoria"),
  professionalEmail: z.string().email("Email professionale non valida"),
  websiteUrl: z.string().url("URL non valido").optional().nullable().or(z.literal("")),
  socialProfileUrl: z.string().url("URL non valido").optional().nullable().or(z.literal("")),
  vatNumber: z.string().optional().nullable(),
  purposeOfUse: z.string().max(1000).optional().nullable(),
});

export type ModelProfileInput = z.infer<typeof modelProfileSchema>;
export type ScoutProfileInput = z.infer<typeof scoutProfileSchema>;
export type VerificationInput = z.infer<typeof verificationSchema>;
