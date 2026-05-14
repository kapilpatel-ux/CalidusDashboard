import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validateBody =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next({
        statusCode: 400,
        message: result.error.errors.map((error) => error.message).join(", "),
      });
    }

    req.body = result.data;
    return next();
  };
