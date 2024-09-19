import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { registerCompany } from "../controllers/company.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(isAuthenticated,upload.single("logo"),registerCompany);


export default router;

