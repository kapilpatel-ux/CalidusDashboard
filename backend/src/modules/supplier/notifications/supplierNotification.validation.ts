import { z } from "zod";

export const supplierNotificationReadSchema = z.object({
  read: z.boolean(),
});

