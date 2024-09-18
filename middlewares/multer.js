import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Ensure the upload directory exists
const tempDir = "./Public/temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true }); // Create directory if it doesn't exist
}

// File type validation for both images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only images and PDF are allowed!"), false); // Reject the file
  }
};

// Configure storage with filename and path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir); // Save files in the './Public/temp' folder
  },
  filename: (req, file, cb) => {
    // Generate a unique random number
    const randomNumber = crypto.randomBytes(8).toString("hex");
    // Get the file extension from the original file name
    const extname = path.extname(file.originalname);
    // Combine random number with file extension
    cb(null, `${randomNumber}${extname}`);
  },
});

// Set up multer with limits and validation
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default upload;
