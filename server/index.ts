import dotenv from 'dotenv';
dotenv.config();
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Adaptations pour Vercel - utilisation d'environnements
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  const isDev = process.env.NODE_ENV === 'development' || app.get("env") === "development";

  if (isDev && !isVercel) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Définir le port approprié pour Vercel ou développement local
  const port = process.env.PORT || 5000;
  if (!isVercel) {
    server.listen({
      port,
      host: "0.0.0.0", // Utilisez 0.0.0.0 au lieu de localhost pour permettre des connexions externes
    }, () => {
      log(`serving on port ${port}`);
    });
  }

  // Pour Vercel serverless
  export default app;
})();
