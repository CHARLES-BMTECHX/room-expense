const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

const app = express();

// Allowed Origins (Supports Local + Vercel/Netlify/Render)
const allowedOrigins = [
  process.env.FRONTEND_URL,        // e.g. https://your-finance-app.vercel.app
  process.env.PRODUCTION_URL,      // Optional second domain
  "http://localhost:5173",         // Vite
  "http://localhost:3000",         // React CRA
  "http://127.0.0.1:5173",
].filter(Boolean); // Remove undefined values

// Secure CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser requests (Postman, mobile, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Required for cookies, auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// No need for app.options("*", cors()) → This was crashing your server!
// It's already handled automatically by the cors middleware above

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/deposits", require("./routes/deposits"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/balance", require("./routes/balance"));

// Health Check
app.get("/", (req, res) => {
  res.json({
    message: "Finance Manager API is LIVE!",
    status: "success",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 Handler
// app.use("*", (req, res) => {
//   res.status(404).json({ error: "Route not found" });
// });

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message,
  });
});

// Start Server Only After DB Connection
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected Successfully");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
      if (process.env.FRONTEND_URL) {
        console.log(`Frontend Connected: ${process.env.FRONTEND_URL}`);
      }
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

startServer();