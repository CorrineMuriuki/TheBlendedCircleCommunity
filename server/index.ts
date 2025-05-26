import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
// Serve static files from attached_assets directory
app.use('/assets', express.static(path.join(__dirname, '..', 'attached_assets')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Validate required environment variables
const requiredEnvVars = [
  'MPESA_CONSUMER_KEY',
  'MPESA_CONSUMER_SECRET',
  'MPESA_SHORTCODE',
  'MPESA_PASSKEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Log M-PESA configuration (without sensitive data)
console.log('M-PESA Configuration:');
console.log('- Base URL:', process.env.MPESA_PRODUCTION === 'true' ? 'Production' : 'Sandbox');
console.log('- Shortcode:', process.env.MPESA_SHORTCODE);
console.log('- Production Mode:', process.env.MPESA_PRODUCTION === 'true');
console.log('- Consumer Key exists:', !!process.env.MPESA_CONSUMER_KEY);
console.log('- Consumer Secret exists:', !!process.env.MPESA_CONSUMER_SECRET);
console.log('- Consumer Key length:', process.env.MPESA_CONSUMER_KEY?.length || 0);
console.log('- Consumer Secret length:', process.env.MPESA_CONSUMER_SECRET?.length || 0);

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error(`[ERROR] ${err.stack || err}`);
    res.status(status).json({ message });
    // Don't rethrow the error after sending a response
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use port 4000 instead of 3000
  const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;
  
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`Server running at http://localhost:${port}`);
  });
})();
