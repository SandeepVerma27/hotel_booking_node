// middlewares/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

const createUploader = (folderName) => {
  const uploadPath = `public/${folderName}`;

  // Ensure folder exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const fileName =
        Date.now() + path.extname(file.originalname).toLowerCase();
      cb(null, fileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowedExtensions.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only jpeg, jpg, png, and webp files are allowed"), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });
};

export default createUploader;
