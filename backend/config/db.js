const dns = require("dns");
const { promisify } = require("util");
const mongoose = require("mongoose");

dns.setDefaultResultOrder("ipv4first");

const resolveSrv = promisify(dns.resolveSrv);

const buildDirectMongoUri = async (srvUri) => {
  const parsed = new URL(srvUri);
  const serviceName = `_mongodb._tcp.${parsed.hostname}`;
  const records = await resolveSrv(serviceName);

  if (!records || records.length === 0) {
    throw new Error(`No SRV records found for ${parsed.hostname}`);
  }

  const hosts = records
    .map((record) => `${record.target.replace(/\.$/, "")}:${record.port}`)
    .join(",");

  const username = encodeURIComponent(parsed.username || "");
  const password = encodeURIComponent(parsed.password || "");
  const database = parsed.pathname.replace(/^\/+/, "") || "admin";

  const searchParams = new URLSearchParams(parsed.searchParams);
  if (!searchParams.has("authSource")) {
    searchParams.set("authSource", "admin");
  }
  if (!searchParams.has("ssl")) {
    searchParams.set("ssl", "true");
  }
  searchParams.delete("appName");

  return `mongodb://${username}:${password}@${hosts}/${database}?${searchParams.toString()}`;
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim().replace(/^['"]|['"]$/g, "");

  if (!mongoUri) {
    console.error("MONGO_URI is missing from .env");
    return false;
  }

  const connectionOptions = {
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    family: 4,
  };

  const URIsToTry = [mongoUri];

  if (mongoUri.startsWith("mongodb+srv://")) {
    try {
      const directUri = await buildDirectMongoUri(mongoUri);
      URIsToTry.push(directUri);
    } catch (err) {
      console.warn("Could not build direct MongoDB URI from SRV records:", err.message);
    }
  }

  let lastError = null;

  for (const uri of URIsToTry) {
    try {
      await mongoose.connect(uri, connectionOptions);
      console.log("MongoDB connected");
      return true;
    } catch (err) {
      lastError = err;
      console.error(`MongoDB connection attempt failed for ${uri.startsWith("mongodb+srv") ? "SRV" : "direct"} URI:`, err.message);
    }
  }

  console.error("MongoDB connection failed:", lastError?.message || "Unknown error");
  if (lastError?.reason) {
    console.error("MongoDB reason:", lastError.reason);
  }
  return false;
};

module.exports = connectDB;
