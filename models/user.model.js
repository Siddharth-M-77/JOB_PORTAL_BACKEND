import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Excludes password field from query results
    },
    role: {
      type: String,
      enum: ["student", "recruiter"],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    profile: {
      bio: {
        type: String,
        trim: true, // Removes leading/trailing spaces
      },
      skills: [
        {
          type: String,
          trim: true, // Ensure skills are properly formatted
        },
      ],
      resume: {
        type: String, // URL for resume
      },
      resumeOriginalName: {
        type: String,
        trim: true,
      },
      otp: {
        type: String,
      },
      otpExpiry: {
        type: Date,
      },
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },
      profilePhoto: {
        type: String,
        default: "", // Default value if no profile photo is provided
        validate: {
          validator: function (v) {
            return /^(ftp|http|https):\/\/[^ "]+$/.test(v); // Optional: Validates URL format for profile photo
          },
          message: (props) => `${props.value} is not a valid URL!`,
        },
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving the user
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  console.log(update);
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (password) {
  console.log(password);
  console.log(this.password);
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
