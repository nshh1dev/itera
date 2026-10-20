import { z } from "zod";

export const adminAccountSchema = z.strictObject({
  userId: z.string().min(1).max(100),
  operation: z.enum(["activate", "deactivate", "promote", "demote"]),
  expectedRole: z.enum(["USER", "ADMIN"]),
  expectedDisabled: z.boolean(),
  password: z.string().min(1).max(128),
  confirmed: z.literal(true),
});
export type AdminAccountInput = z.infer<typeof adminAccountSchema>;
