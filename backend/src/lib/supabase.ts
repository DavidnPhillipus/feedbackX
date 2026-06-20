import { createClient } from "@supabase/supabase-js";
import env from "dotenv";

env.config({ override: true });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn("Supabase credentials missing — image uploads will fail");
}

export const supabase = createClient(url || "", key || "");
export const STORAGE_BUCKET = "post-images";

export function getPublicUrl(path: string) {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
