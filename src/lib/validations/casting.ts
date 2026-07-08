import { z } from "zod";
import { moodboardSchema } from "./moodboard";

export const castingSchema = z.object({
  title: z.string().min(3, "Il titolo deve contenere almeno 3 caratteri").max(200),
  description: z.string().min(20, "La descrizione deve contenere almeno 20 caratteri").max(5000),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  castingDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  requirements: z.string().max(3000).optional().nullable(),
  compensation: z.string().max(500).optional().nullable(),
  isPaid: z.boolean().default(false),
  spots: z.coerce.number().min(1).max(1000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  // New casting type fields
  castingType: z.enum(["PHYSICAL", "ONLINE"]).optional().nullable(),
  time: z.string().max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  instructions: z.string().max(3000).optional().nullable(),
  materialsRequired: z.string().max(3000).optional().nullable(),
  moodboard: moodboardSchema,
});

export const castingApplicationSchema = z.object({
  castingId: z.string().cuid(),
  introMessage: z.string().max(1000).optional().nullable(),
});

export type CastingInput = z.infer<typeof castingSchema>;
export type CastingApplicationInput = z.infer<typeof castingApplicationSchema>;
