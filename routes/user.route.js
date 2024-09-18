import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js"
import { userRegistration } from "../controllers/user.controller.js";


const router = Router()
router.route("/register").post(upload.single('profilePhoto'),userRegistration)


export default router;