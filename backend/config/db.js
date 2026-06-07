const mongoose = require("mongoose");

const connectDB = async () => {
  const maxRetries = 5;
  const retryDelayMs = 3000;

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing from .env");
    process.exit(1);
  }

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log("MongoDB connected");
      return;
    } catch (err) {
      console.error( err );

      if (attempt === maxRetries) {
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
};

module.exports = connectDB;
