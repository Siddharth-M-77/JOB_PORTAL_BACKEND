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
      select: false,
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
        validate: {
          validator: function (v) {
            return /^(ftp|http|https):\/\/[^ "]+$/.test(v); // Validates URL format
          },
          message: (props) => `${props.value} is not a valid URL!`,
        },
      },
      resumeOriginalName: {
        type: String,
        trim: true,
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, enteredPassword);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
