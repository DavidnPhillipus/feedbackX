import type { Request, Response, NextFunction } from "express";
import z from "zod";

export class ValidationError extends Error {
  constructor(public validationErrors: z.ZodIssue[]) {
    super("Validation Error");
    this.name = this.constructor.name;
  }
}

const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ errors: err.validationErrors });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Image too large (max 10MB)" });
  }

  if (err.message?.includes("Only image files")) {
    return res.status(400).json({ error: err.message });
  }

  if (err.message === "404" || err.code === "P2025") {
    return res.status(404).json({ error: "resource not found" });
  }

  console.log("Error message", err.message);
  console.log("Error code", err.code);

  return res.status(500).json({ error: "Something went wrong" });
};

export default { errorHandler };
