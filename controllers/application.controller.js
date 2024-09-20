import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

export const applyJob = async (req, res) => {
  try {
    const userId = req.id; // Extract the applicant's ID from the request
    const jobId = req.params.id; // Extract the job ID from the request parameters

    // Validate that a job ID is provided
    if (!jobId) {
      return res.status(400).json({
        message: "Job ID is required.",
        success: false,
      });
    }

    // Check if the user has already applied for the job
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job.",
        success: false,
      });
    }

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    // Create a new job application
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    // Add the new application to the job's application list
    job.applications.push(newApplication._id);
    await job.save(); // Save the job with the updated applications list

    // Respond with a success message
    return res.status(201).json({
      message: "Job applied successfully.",
      success: true,
    });
  } catch (error) {
    // Log the error for debugging and send an error response
    console.log("Apply-job-error:", error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;

    // Fetch applications by userId and sort them by createdAt (most recent first)
    const applications = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .populate({
        path: "job",
        options: { sort: { createdAt: -1 } }, // Sort jobs by creation time
        populate: {
          path: "company",
          options: { sort: { createdAt: -1 } }, // Sort companies by creation time
        },
      });

    // Check if no applications were found
    if (!applications || applications.length === 0) {
      return res.status(404).json({
        message: "No applications found",
        success: false,
      });
    }

    // Return the applications
    return res.status(200).json({
      applications,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
