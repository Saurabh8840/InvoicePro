import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", 
  ];

  
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".heic", ".xlsx", ".xls"];

  
  if (allowedMimes.includes(mime)) {
    cb(null, true);
  } else if (mime === "application/octet-stream" && (ext === ".xlsx" || ext === ".xls")) {
    
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Please upload PDF, Image, or Excel.`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});