import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import { ENV } from "./lib/env.js";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.config.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";

const PORT = ENV.PORT;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
if (ENV.NODE_ENV === "production") {
  app.use(
    cors({
      origin: ENV.CORS_ORIGIN,
      credentials: true,
    })
  );
} else {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
}

// Helmet: enable sensible defaults. Disable CSP in development to avoid blocking
// Devtools and fonts while you're iterating. In production, enable a relaxed CSP.
if (ENV.NODE_ENV === "production") {
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  });
} else {
  // In development, turn off CSP so fonts, devtools endpoints, and HMR can work
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
}

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    res.status(503).json({
      status: "unhealthy",
      message: "Application or a dependency is experiencing issues.",
    });
  }
});

app.get("/books", (req, res) => {
  res.send("This is default Route!");
});

// Routes Api gateway
app.use("/api/inngest", serve({ client: inngest, functions }));

// Serve SPA static files if build exists (works in production and allows quick local testing)
const staticPath = path.join(__dirname, "..", "..", "web", "dist");
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));

  // catch-all route to serve index.html for client-side routing
  app.get("/{*any}", (req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    res.sendFile(indexPath);
  });
} else {
  console.log(
    "No web/dist found at:",
    staticPath,
    " — static assets will not be served. Build your front-end (e.g., `npm run build` in /web) or place files in that folder."
  );
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on PORT ===> ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit with failure
  }
};

startServer();

export default app;
