import type { Request, Response, NextFunction } from "express";
import z from "zod";

export class ValidationError extends Error {
  constructor(public validationErrors: z.ZodIssue[]) {
    super("Validation Error");
    this.name = this.constructor.name;
  }
}

function prismaDbUnavailable(err: any): boolean {
  const code = err?.code || err?.errorCode;
  const name = String(err?.name || "");
  const message = String(err?.message || err || "");
  return (
    code === "P1001" ||
    code === "P1002" ||
    code === "P1017" ||
    code === "P2024" ||
    name.includes("PrismaClientInitializationError") ||
    /Can't reach database server/i.test(message) ||
    /Timed out fetching a new connection/i.test(message) ||
    /Server has closed the connection/i.test(message)
  );
}

const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
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

  if (prismaDbUnavailable(err)) {
    console.error("Database unavailable:", err.code || "", err.message);
    return res.status(503).json({
      error:
        "Database is temporarily unreachable. Wake your Supabase project in the dashboard, wait a few seconds, then try again.",
      code: err.code || "DB_UNAVAILABLE",
    });
  }

  console.error("Unhandled error:", err.code || "", err.message || err);

  return res.status(500).json({ error: "Something went wrong" });
};

export default { errorHandler };
