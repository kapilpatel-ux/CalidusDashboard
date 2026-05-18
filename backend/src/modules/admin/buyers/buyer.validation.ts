import { z } from "zod";

export const buyerStatusSchema = z.object({ status: z.string().min(1) });
