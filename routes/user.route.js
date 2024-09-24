import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
  updateProfile,
  userLogin,
  userLogout,
  userRegistration,
} from "../controllers/user.controller.js";
import {
  sendOtp,
  verifyOtpAndResetPassword,
} from "../controllers/user.controller.js";

const router = Router();
router.route("/register").post(upload.single("profilePhoto"), userRegistration);

router.route("/login").post(userLogin);
router.route("/logout").get(userLogout);
router
  .route("/profile/update")
  .post(isAuthenticated, upload.single("file"), updateProfile);

// Route to send OTP
router.post("/send-otp", sendOtp);

// Route to verify OTP and reset password
router.post("/verify-otp-reset-password", verifyOtpAndResetPassword);

export default router;
