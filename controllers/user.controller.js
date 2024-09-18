import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import cloudinary from "../utils/cloudinary.js"; // Ensure the correct path
import getDataUri from "../utils/getDataUri.js"; // Ensure the correct path

export const userRegistration = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, role } = req.body;

    // Check if any field is empty
    if ([fullName, email, password, phoneNumber, role].some(field => field.trim() === "")) {
      return res.status(400).json({
        message: "All fields are required!",
        success: false,
      });
    }

    // Check if profile photo was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Profile photo is required!",
        success: false,
      });
    }

    // Handle file upload and conversion
    const file = req.file;
    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User is already registered with this email. Please try another email.",
        success: false,
      });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create new user
    const createdUser = await User.create({
      fullName,
      email,
      phoneNumber,
      role,
      password: hashPassword,
      profile: {
        profilePhoto: cloudResponse.secure_url,
      },
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
      user: createdUser,
    });

  } catch (error) {
    console.log("User Registration Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
