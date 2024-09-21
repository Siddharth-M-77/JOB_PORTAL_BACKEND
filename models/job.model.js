import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String],
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  experience: {
    type: String, // Update this to String if you need to store something like "2-3 years"
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
  },
  position: {
    type: String, // Update this to String if you need to store position as a string
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application", 
  }],
}, { timestamps: true });

export const Job = mongoose.model("Job", jobSchema);
