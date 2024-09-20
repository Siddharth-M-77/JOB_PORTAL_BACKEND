import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getCompany,
  getCompanyById,
  registerCompany,
  updateCompany,
} from "../controllers/company.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router
  .route("/register")
  .post(isAuthenticated, upload.single("logo"), registerCompany);
router.route("/get").get(isAuthenticated, getCompany);
router.route("/get/:id").get(isAuthenticated, getCompanyById);
router.route("/update/:id").put(isAuthenticated,upload.single('file'), updateCompany);

export default router;
