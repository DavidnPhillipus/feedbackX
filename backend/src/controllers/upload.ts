import type { RequestHandler } from "express";
import { getMediaKind } from "../utils/fileTypes.js";
import { uploadToSupabase } from "../utils/supabaseStorage.js";

export const uploadImage: RequestHandler = async (req, res) => {
  try {
    if (req.file) {
      const url = await uploadToSupabase(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
      const kind = getMediaKind(req.file.mimetype);
      return res.json({
        url,
        type: req.file.mimetype,
        name: req.file.originalname,
        mediaKind: kind,
      });
    }

    const { image } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "No image provided" });
    }

    const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const [, mimeType, data] = match;
    if (!mimeType || !data) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const buffer = Buffer.from(data, "base64");
    const url = await uploadToSupabase(buffer, mimeType);

    res.json({ url, type: mimeType, mediaKind: getMediaKind(mimeType) });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Upload failed" });
  }
};

export const uploadFile: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const url = await uploadToSupabase(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );
    const mediaKind = getMediaKind(req.file.mimetype);

    res.json({
      url,
      type: req.file.mimetype,
      name: req.file.originalname,
      mediaKind,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Upload failed" });
  }
};
