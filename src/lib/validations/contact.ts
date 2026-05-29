import { z } from "zod";

export const contactRequestSchema = z.object({
  modelProfileId: z.string().cuid(),
  subject: z.string().min(3, "L'oggetto deve contenere almeno 3 caratteri").max(200),
  message: z.string().min(10, "Il messaggio deve contenere almeno 10 caratteri").max(2000),
  reason: z.enum(["SCOUTING", "CASTING", "JOB_OPPORTUNITY", "EDITORIAL", "OTHER"]),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;
