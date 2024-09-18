import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import getDataUri from "../utils/dataURI.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export const userRegistration = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, role } = req.body;

    // Check if any field is empty
    if (
      [fullName, email, password, phoneNumber, role].some(
        (field) => field.trim() === ""
      )
    ) {
      return res.status(400).json({
        message: "All fields are required!",
        success: false,
      });
    }

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Profile photo is required!",
        success: false,
      });
    }

    const localPath = req.file.path;
    // console.log(localPath);

    // Upload image to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(localPath, {
      folder: "user_photos",
    });
    // console.log(cloudinaryResponse.public_id);
    // Delete the local file after uploading to Cloudinary
    fs.unlinkSync(localPath);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message:
          "User is already registered with this email. Please try another email.",
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
        profilePhoto: cloudinaryResponse.secure_url, // use Cloudinary response URL
      },
    });
    const newUser = await User.findOne(createdUser._id).select("-password");

    if (!newUser) {
      // Delete the uploaded files from Cloudinary if user creation fails
      await cloudinary.uploader.destroy(cloudinaryResponse.public_id);

      return res
        .status(500)
        .json({ message: "Something went wrong while registering the user" });
    }

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.log("User Registration Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Find the user and select the password field for comparison
    const existingUser = await User.findOne({ email }).select('+password');

    if (!existingUser) {
      return res.status(404).json({
        message: "This email is not registered. Please register first.",
        success: false,
      });
    }

    // Compare entered password with stored hashed password
    const passwordMatch = await existingUser.comparePassword(password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid password!",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Login successfully 🤩🤩🤩",
      success: true,
    });
  } catch (error) {
    console.log("Login Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

