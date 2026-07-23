import { createClient } from "@supabase/supabase-js";



const url = import.meta.env.VITE_SUPABASE_URL;

const key = import.meta.env.VITE_SUPABASE_ANON_KEY;



export const supabase = url && key ? createClient(url, key) : null;

export const STORAGE_BUCKET = "post-images";



function extensionForFile(file) {

  const fromName = file.name?.split(".").pop();

  if (fromName && fromName.length <= 5) return fromName.toLowerCase();



  const map = {

    "image/jpeg": "jpg",

    "image/png": "png",

    "image/gif": "gif",

    "image/webp": "webp",

    "video/mp4": "mp4",

    "video/webm": "webm",

    "video/quicktime": "mov",

    "application/pdf": "pdf",

    "text/plain": "txt",

  };

  return map[file.type] || "bin";

}



export async function uploadToSupabase(file) {

  if (!supabase) {

    throw new Error("Supabase is not configured");

  }



  const ext = extensionForFile(file);

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;



  const { data, error } = await supabase.storage

    .from(STORAGE_BUCKET)

    .upload(filename, file, {

      contentType: file.type,

      upsert: false,

    });



  if (error) {

    throw new Error(error.message || "Failed to upload file");

  }



  const { data: publicData } = supabase.storage

    .from(STORAGE_BUCKET)

    .getPublicUrl(data.path);



  return { url: publicData.publicUrl };

}

