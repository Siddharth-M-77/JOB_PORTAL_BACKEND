import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import cloudinary from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import getDataUr from "../utils/dataURI.js"
import path from "path";

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
    const existingUser = await User.findOne({ email }).select("+password");

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

    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back !! ${existingUser.fullName}`,
        success: true,
        existingUser,
      });
  } catch (error) {
    console.log("Login Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const userLogout = async (req, res) => {
  res.cookie("token", "", { maxAge: 0 }).status(200).json({
    message: "Logout Successfully 🤞🤞🤞🤞",
  });
};


export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;

    const file = req.file;
    console.log(file);
    

    // Check if file is uploaded
    if (file) {
      const localPath = file.path;
      // Upload image to Cloudinary
      const cloudResponse = await cloudinary.uploader.upload(localPath);
      // Delete the local file after uploading to Cloudinary
      fs.unlinkSync(localPath);

      // Prepare the resume URL and original name
      const resumeUrl = cloudResponse.secure_url;
      const resumeOriginalName = file.originalname;

      // Resume data to be updated
      req.body.profile = {
        resume: resumeUrl,
        resumeOriginalName: resumeOriginalName,
      };
    }

    const userId = req.id; // middleware authentication
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    // Update user data
    if (fullname) user.fullName = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skills.split(",");

    // Update resume data if provided
    if (req.body.profile) {
      user.profile.resume = req.body.profile.resume;
      user.profile.resumeOriginalName = req.body.profile.resumeOriginalName;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully.",
      user,
      success: true,
    });
  } catch (error) {
    console.log("Update Profile Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
