const mongoose = require("mongoose");

const URI = process.env.DATABASE_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(URI);
    console.log("Database connected.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // process.exit(1);
  }
};

module.exports = { connectDB };
