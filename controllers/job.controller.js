import { Job } from "../models/job.model.js";

export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      experience,
      location,
      jobType,
      position,
      companyId,
    } = req.body;
    console.log(req.body)
    const userId = req.id;

    // Validate the required fields
    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !experience ||
      !location ||
      !jobType ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "All fields are required.",
        success: false,
      });
    }

    // Create a new job
    const job = await Job.create({
      title,
      description,
      requirements,
      salary,
      experience,
      location,
      jobType,
      position,
      companyId,
      created_by:userId
    });

    return res.status(201).json({
      message: "Job posted successfully.",
      success: true,
      job,
    });
  } catch (error) {
    console.error("Post Job Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
// student k liye
export const getAllJobs = async (req, res) => {
  try {
    // Extract the keyword from the query parameters (URL)
    // Example URL: /jobs?keyword=developer
    // If no keyword is provided, use an empty string as default
    const keyword = req.query.keyword || "";
    console.log(keyword)

    // Create a query to search for jobs
    // The $or operator allows us to search in multiple fields (title and description)
    // $regex allows partial match of the keyword, meaning the keyword doesn't have to be exact
    // $options: "i" makes the search case-insensitive (e.g., 'Developer' and 'developer' will be treated the same)
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };

    // Fetch jobs from the database that match the query
    // The populate function fills in details about the company (assuming jobs have a reference to a company)
    // Sorting the results by createdAt field in descending order (latest jobs first)
    const jobs = await Job.find(query)
      .populate({
        path: "companyId", // This assumes each job has a reference to a company
      })
      .sort({ createdAt: -1 });

    if (!jobs || jobs.length === 0) {
      // Also checking for empty jobs array
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({
      jobs, // This sends back the list of jobs
      success: true,
    });
  } catch (error) {
    console.log(error);
    // Return a 500 status (internal server error) if something goes wrong
    return res.status(500).json({
      message: "Something went wrong while fetching jobs.",
      success: false,
    });
  }
};

// Controller function to get a job by its ID
export const getJobById = async (req, res) => {
  try {
    // Extracting the job ID from the URL parameters
    const jobId = req.params.id;

    // Find the job by its ID from the Job model
    // The populate method is used to fetch related "applications" (assuming a job has associated applications)
    const job = await Job.findById(jobId).populate({
      path: "applications", // This means the applications field in the Job schema is a reference (ObjectId)
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    return res.status(200).json({
      job, // Send the job data
      success: true,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "An error occurred while fetching the job.",
      success: false,
    });
  }
};

// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id; // Ensure you are getting this from the authenticated middleware
    console.log("AdminId: ", adminId);

    // Fetch jobs created by the admin
    const jobs = await Job.find({ createdBy: adminId }) // Ensure this field exists in the Job schema
      .populate({
        path: "companyId", // Populate with the correct field name
        select: "name description location website logo", // Choose which fields you want to return
      })
      .sort({ createdAt: -1 }); // Sort jobs by creation date

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }

    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.error("Get Admin Jobs Error:", error);
    return res.status(500).json({
      message: "Server error occurred",
      success: false,
    });
  }
};
