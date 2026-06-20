import { setupSupabaseStorage } from "./setup-supabase-storage.js";
import { uploadToSupabase } from "./utils/supabaseStorage.js";

async function main() {
  await setupSupabaseStorage();

  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const buffer = Buffer.from(pngBase64, "base64");

  const url = await uploadToSupabase(buffer, "image/png", "test");
  console.log("Upload test OK");
  console.log("Public URL:", url);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Uploaded file not reachable: ${res.status}`);
  }
  console.log("Public URL reachable:", res.status);
}

main().catch((e) => {
  console.error("Upload test failed:", e.message);
  process.exit(1);
});
