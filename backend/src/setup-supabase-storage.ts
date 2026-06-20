import prisma from "./prisma.js";

const STORAGE_SQL = `
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  10485760,
  ARRAY['image/jpeg','image/png','image/gif','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
`;

const POLICIES = [
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'Public read post images' AND tablename = 'objects'
    ) THEN
      CREATE POLICY "Public read post images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'post-images');
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can upload post images' AND tablename = 'objects'
    ) THEN
      CREATE POLICY "Anyone can upload post images"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'post-images');
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update post images' AND tablename = 'objects'
    ) THEN
      CREATE POLICY "Anyone can update post images"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'post-images');
    END IF;
  END $$;`,
];

export async function setupSupabaseStorage() {
  try {
    await prisma.$executeRawUnsafe(STORAGE_SQL);
    for (const policy of POLICIES) {
      await prisma.$executeRawUnsafe(policy);
    }
    console.log("Supabase Storage bucket 'post-images' ready");
  } catch (err: any) {
    console.warn("Storage setup note:", err.message);
  }
}

const isDirectRun = process.argv[1]?.includes("setup-supabase-storage");
if (isDirectRun) {
  setupSupabaseStorage()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
}
