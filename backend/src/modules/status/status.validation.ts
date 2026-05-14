import { z } from "zod";

export const createStatusCheckSchema = z.object({
  client_name: z.string().min(1),
});
