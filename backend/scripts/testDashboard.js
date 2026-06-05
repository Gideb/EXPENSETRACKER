require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;
const BASE = `http://localhost:${PORT}`;

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne();
    if (!user) {
      console.error("No users found in DB. Create a user first.");
      process.exit(1);
    }

    const token = jwt.sign({ id: String(user._id) }, JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("Using user:", user._id.toString());

    const url = `${BASE}/api/v1/dashboard`;

    // wait for server up
    const maxRetries = 20;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const start = Date.now();
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 20000,
        });
        const elapsed = Date.now() - start;
        console.log(`Status: ${res.status} - Time: ${elapsed}ms`);
        console.log("Response keys:", Object.keys(res.data));
        if (res.data.recentTransactions)
          console.log(
            "recentTransactions length:",
            res.data.recentTransactions.length,
          );
        process.exit(0);
      } catch (err) {
        attempt++;
        console.log(
          `Attempt ${attempt} failed: ${err.message}. Retrying in 500ms...`,
        );
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    console.error("Server did not respond after retries");
    process.exit(2);
  } catch (err) {
    console.error("Error in test script:", err.message || err);
    process.exit(1);
  }
}

main();
