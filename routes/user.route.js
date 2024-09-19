import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js"
import { updateProfile, userLogin, userLogout, userRegistration } from "../controllers/user.controller.js";


const router = Router()
router.route("/register").post(upload.single('profilePhoto'),userRegistration)
router.route("/login").post(userLogin)
router.route("/logout").get(userLogout)
router.route("/profile/update").post(isAuthenticated,upload.single('file'),updateProfile);


export default router;