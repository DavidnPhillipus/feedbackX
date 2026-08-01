import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
});

function isTransientDbError(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return code === "P1001" || code === "P1017" || code === "P2024" || code === "P1002";
}

export async function ensureDbReady(retries = 4, delayMs = 1000): Promise<void> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      if (attempt > 1) {
        console.log(`Database connection restored (attempt ${attempt})`);
      }
      return;
    } catch (err) {
      lastErr = err;
      console.warn(
        `Database not ready (attempt ${attempt}/${retries}):`,
        (err as Error)?.message || err
      );
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastErr;
}

/** Retry transient Supabase/pooler blips that otherwise surface as login/register 500s. */
export async function withDbRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransientDbError(err) || attempt === retries) {
        throw err;
      }
      try {
        await prisma.$disconnect();
      } catch {
        /* ignore */
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  throw lastErr;
}

export default prisma;
