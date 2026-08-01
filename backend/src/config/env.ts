import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function assertEnv() {
  const isProduction = process.env.NODE_ENV === "production";

  required("DATABASE_URL");
  required("JWT_SECRET");

  if (isProduction) {
    required("CLIENT_URL");
    required("SUPABASE_URL");
    required("SUPABASE_ANON_KEY");
  } else if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn("Supabase credentials missing — image uploads will fail");
  }
}

/** Supports a single origin or comma-separated list for CORS. */
export function resolveCorsOrigin(clientUrl = process.env.CLIENT_URL): string | string[] | boolean {
  const raw = clientUrl?.trim();
  if (!raw || raw === "*") return true;
  const origins = raw.split(",").map((o) => o.trim()).filter(Boolean);
  if (origins.length === 0) return true;
  if (origins.length === 1) return origins[0]!;
  return origins;
}

export function getPort(): number {
  return Number(process.env.PORT) || 8080;
}
