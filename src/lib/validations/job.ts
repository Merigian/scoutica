import { z } from "zod";
import { moodboardSchema } from "./moodboard";

export const jobSchema = z.object({
  title: z.string().min(3, "Il titolo deve contenere almeno 3 caratteri").max(200),
  description: z.string().min(20, "La descrizione deve contenere almeno 20 caratteri").max(5000),
  jobType: z.enum([
    "SHOOTING",
    "ECOMMERCE",
    "CAMPAIGN",
    "RUNWAY",
    "FITTING",
    "SHOWROOM",
    "SOCIAL_COLLAB",
    "EVENT",
    "HOSTESS",
    "OTHER",
  ]),
  brand: z.string().max(200).optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  jobDates: z.string().max(500).optional().nullable(),
  compensation: z.string().max(500).optional().nullable(),
  isPaid: z.boolean().default(false),
  modelRequirements: z.string().max(3000).optional().nullable(),
  spotsNeeded: z.coerce.number().min(1).max(1000).optional().nullable(),
  deadline: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  moodboard: moodboardSchema,
});

export type JobInput = z.infer<typeof jobSchema>;

export const jobApplicationSchema = z.object({
  jobId: z.string().cuid(),
  introMessage: z.string().max(1000).optional().nullable(),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
