import Job from "../models/job.model.js";

export const postJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experience,
            position,
            companyId,
        } = req.body;
        const userId = req.id;
        if (
            !title ||
            !description ||
            !requirements ||
            !salary ||
            !location ||
            !jobType ||
            !experience ||
            !position ||
            !companyId
        ) {
            return res.status(400).json({
                message: "Somethin is missing.",
                success: false,
            });
        }
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary,
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId,
        });
        return res.json({
            message: "New job created successfully.",
            job,
            success: true,
        });
    } catch (error) {
        console.log("PostJob-Error", error);
    }
};
// student k liye
export const getAllJobs = async (req, res) => {
    try {
        // Extract the keyword from the query parameters (URL)
        // Example URL: /jobs?keyword=developer
        // If no keyword is provided, use an empty string as default
        const keyword = req.query.keyword || "";

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
                path: "company", // This assumes each job has a reference to a company
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


