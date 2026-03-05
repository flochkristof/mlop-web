import { z } from "zod";

export const passThroughCredentialsSchema = z.object({
  email: z.string().trim().max(255, "Maximum 255 characters allowed."),
  password: z.string().max(72, "Maximum 72 characters allowed."),
});

export type PassThroughCredentialsSchema = z.infer<
  typeof passThroughCredentialsSchema
>;
