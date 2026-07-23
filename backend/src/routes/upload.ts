import express from "express";
import multer from "multer";
import * as uploadController from "../controllers/upload.js";
import { ALL_ALLOWED_MIMES } from "../utils/fileTypes.js";

const router = express.Router();

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALL_ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Unsupported file type. Use images, videos (MP4/WebM/MOV), PDF, or documents (DOC/DOCX/XLS/XLSX/PPT/PPTX/TXT)"
        )
      );
    }
  },
});

router.post("/image", imageUpload.single("image"), uploadController.uploadImage);
router.post("/file", fileUpload.single("file"), uploadController.uploadFile);

export default router;
