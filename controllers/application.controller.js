import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

export const applyJob = async (req, res) => {
  try {
    const userId = req.id; 
    const jobId = req.params.id;
    

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
    await job.save(); 

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
          path: "companyId",
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

// admin dekhega kitna user ne apply kiya hai
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "applicant",
      },
    });
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }
    return res.status(200).json({
      job,
      succees: true,
    });
  } catch (error) {
    console.log(error);
  }
};


export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    // Check if status is provided
    if (!status) {
      return res.status(400).json({
        message: "Status is required",
        success: false,
      });
    }

    // Validate if the applicationId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        message: "Invalid application ID format.",
        success: false,
      });
    }

    // Find the application by application ID
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
        success: false,
      });
    }

    // Update the status (convert it to lowercase to maintain consistency)
    application.status = status.toLowerCase();
    await application.save();

    return res.status(200).json({
      message: "Status updated successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};
