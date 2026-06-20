import type { RequestHandler } from "express";
import { uploadToSupabase } from "../utils/supabaseStorage.js";

export const uploadImage: RequestHandler = async (req, res) => {
  try {
    if (req.file) {
      const url = await uploadToSupabase(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
      return res.json({ url });
    }

    const { image } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "No image provided" });
    }

    const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], "base64");
    const url = await uploadToSupabase(buffer, mimeType);

    res.json({ url });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Upload failed" });
  }
};
