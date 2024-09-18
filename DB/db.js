import mongoose from "mongoose";

const connectDB = async () => {
  try {
    let connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}`
    );
    console.log(
      `\n MONGO-DB CONNECTED SUCCESSFULLY !!! ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB Connection Error", error);
  }
};

export default connectDB;
