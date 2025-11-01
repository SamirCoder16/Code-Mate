import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import { ENV } from "./lib/env.js";
import path from "path";
import { fileURLToPath } from "url";

const PORT = ENV.PORT;
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

// Helmet: enable sensible defaults. Disable CSP in development to avoid blocking
// Devtools and fonts while you're iterating. In production, enable a relaxed CSP.
if (ENV.NODE_ENV === "production") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
    })
  );
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

// Serve SPA static files if build exists (works in production and allows quick local testing)
const staticPath = path.join(__dirname, "..", "..", "web", "dist");
if (fs.existsSync(staticPath)) {
  console.log("Serving static files from:", staticPath);
  app.use(express.static(staticPath));

  // catch-all route to serve index.html for client-side routing
  app.get("/{*any}", (req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    console.log("Sending index.html ->", indexPath);
    res.sendFile(indexPath);
  });
} else {
  console.log(
    "No web/dist found at:",
    staticPath,
    " — static assets will not be served. Build your front-end (e.g., `npm run build` in /web) or place files in that folder."
  );
}

app.listen(PORT, () => {
  console.log(`Server is running on PORT ===> ${PORT}`);
});

export default app;
