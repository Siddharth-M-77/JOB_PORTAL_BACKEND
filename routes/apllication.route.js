import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  applyJob,
  getApplicants,
  updateStatus,
  getAppliedJobs,
} from "../controllers/application.controller.js";

const router = Router();

router.route("/apply/:id").post(isAuthenticated, applyJob);
router.route("/get").get(isAuthenticated, getAppliedJobs);
router.route("/:id/applicants").get(isAuthenticated, getApplicants);
router.route("/status/:id/update").get(isAuthenticated, updateStatus);
