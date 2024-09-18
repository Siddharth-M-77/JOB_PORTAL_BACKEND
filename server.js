import express from "express";
import dotenv from "dotenv";
import connectDB from "./DB/db.js";
dotenv.config({}); // load environment variables
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "Public" directory
app.use(express.static("Public"));

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Middleware to parse cookies
app.use(cookieParser());

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\nServer is running on port ${PORT}`);
    });
}).catch((error) => {
    console.log("MONGO-DB CONNECTION FAILED", error);
});

