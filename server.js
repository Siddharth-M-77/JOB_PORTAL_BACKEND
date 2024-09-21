import express from "express";
import dotenv from "dotenv";
import connectDB from "./DB/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import jobRouter from "./routes/job.route.js";
import companyRouter from "./routes/company.routes.js";
import applicationRouter from "./routes/application.route.js";
dotenv.config({}); // Load environment variables
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "Public" directory
app.use(express.static("Public"));

// Enable Cross-Origin Resource Sharing with specific frontend origin
const corsOptions = {
  origin: "https://job-portal-frontend-topaz.vercel.app",
  credentials: true, // Allow cookies from this origin
};
app.use(cors(corsOptions));

// Middleware to parse cookies
app.use(cookieParser());

const PORT = process.env.PORT || 4000;

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/applicants", applicationRouter);

// Connect to MongoDB and start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\nServer is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO-DB CONNECTION FAILED", error);
  });
