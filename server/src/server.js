import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { ENV } from "./lib/env.js";

const PORT = ENV.PORT;
const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Deafult Route
app.get("/", (req, res) => {
  res.send("This is default Route!");
});
// Health Check Route
app.get("/health", (req, res) => {
  // Perform checks here, e.g., database connection, external API reachability
  const isDatabaseHealthy = true; // Replace with actual database check
  const isExternalServiceHealthy = true; // Replace with actual external service check

  if (isDatabaseHealthy && isExternalServiceHealthy) {
    res
      .status(200)
      .json({ status: "healthy", message: "Application is running smoothly." });
  } else {
    res
      .status(503)
      .json({
        status: "unhealthy",
        message: "Application or a dependency is experiencing issues.",
      });
  }
});

// Routes Api gateWay

app.listen(PORT, () => {
  console.log(`Server is running on PORT ===> ${PORT}`);
});

export default app;
