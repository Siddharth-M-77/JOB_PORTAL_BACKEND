import { Company } from "../models/company.model.js";
import fs from "fs";

import cloudinary from "../utils/cloudinary.js"; // Assuming cloudinary is configured
import deleteFile from "../utils/deleteFile.js";

export const registerCompany = async (req, res) => {
  let localPath = ""

  try {
    const { name, description, location, website } = req.body;
    const userId = req.id; // Assuming authentication middleware provides userId

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
      console.log("deleted Successfully localfiles!!!")
    }

    return res.status(500).json({
      message: "Server error while registering the company.",
      success: false,
    });
  }
};
