import { Company } from "../models/company.model.js";
import fs from "fs";
import cloudinary from "../utils/cloudinary.js";
import deleteFile from "../utils/deleteFile.js";
import mongoose from "mongoose";

  export const registerCompany = async (req, res) => {
    let localPath = "";

    try {
      const { name, description, location, website } = req.body;

      const userId = req.id; 
      console.log(name,description)
      console.log("user-iddd",userId)

      // Check if required fields are present
      if (!name || !description) {
        return res.status(400).json({
          message: "Name and description are required.",
          success: false,
        });
      }

      let logoUrl = "";
      if (req.file) {
        const file = req.file;
        // Convert file to Data URI and upload to cloudinary
        const localPath = file.path;
        // Upload image to Cloudinary
        const cloudResponse = await cloudinary.uploader.upload(localPath);
        // Delete the local file after uploading to Cloudinary
        fs.unlinkSync(localPath);

        // Set logo URL from cloudinary response
        logoUrl = cloudResponse.secure_url;
      }

      // Create a new company entry
      const newCompany = await Company.create({
        name,
        description,
        location,
        website,
        logo: logoUrl, // Save the logo URL
        userId,
      });

      return res.status(201).json({
        message: "Company registered successfully.",
        company: newCompany,
        success: true,
      });
    } catch (error) {
      console.error("RegisterCompany-Error", error);
      if (localPath) {
        deleteFile(localPath);
        console.log("deleted Successfully localfiles!!!");
      }

      return res.status(500).json({
        message: "Server error while registering the company.",
        success: false,
      });
    }
  };

// Ye function logged-in user ki companies fetch karega

export const getCompany = async (req, res) => {
  try {
    const userId = req.id;

    // Hum Company collection me search karenge, jaha userId match karta ho
    const companies = await Company.findOne({ userId }); // findOne for a single company, use find if multiple

    if (!companies) {
      return res.status(404).json({
        message: "No company found",
      });
    }
    return res.status(200).json({
      companies,
      success: true,
    });
  } catch (error) {
    console.log("Get-company-error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;

    // Check if the companyId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        message: "Invalid company ID format.",
        success: false,
      });
    }

    // Find the company by its ID
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Company not found", // Fixed typo
        success: false,
      });
    }

    return res.status(200).json({
      company,
      success: true,
    });
  } catch (error) {
    console.log("Get-company-error-by-Id:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// Function to update company information
export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    let logo; // Initialize logo variable for the new file URL

    //cheak if file is uploaded
    if (req.file) {
      const localPath = req.file.path;

      // Upload file to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(localPath, {
        folder: "company_logos", // Cloudinary folder name
      });

      // Get the secure URL from Cloudinary response
      logo = cloudinaryResponse.secure_url;

      // Delete the file from the local system after successful upload
      fs.unlink(localPath);
    }
    const updateData = { name, description, website, location };
    // Add logo if a new one was uploaded
    if (logo) {
      updateData.logo = logo;
    }
    // Find the company by ID and update with the new data

    const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true, // Return the updated company object
    });

    // If no company found, return 404
    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        success: false,
      });
    }
    // Return success response with the updated company info

    return res.status(200).json({
      message: "Company information updated successfully.",
      company,
      success: true,
    });
  } catch (error) {
    console.log("Error updating company:", error);

    // Return internal server error if something goes wrong
    return res.status(500).json({
      message: "Internal Server Error.",
      success: false,
    });
  }
};
