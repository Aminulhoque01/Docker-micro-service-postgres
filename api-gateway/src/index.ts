


import cors from "cors";
import * as dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { configureRoutes } from "./utils";

dotenv.config();

const app = express();
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req: Request, res: Response) => {
    res.status(429).json({ message: "Too many requests, please try again later" });
  },
});


app.use("/api", limiter);
app.use(morgan("dev"));
app.use(express.json());

// Register routes before the 404 handler
configureRoutes(app);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "API Gateway is running" });
});

// 404 handler
app.use(helmet());
app.use("/api", limiter);
app.use(morgan("dev"));
app.use(express.json());

// Register routes before the 404 handler
configureRoutes(app);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "API Gateway is running" });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Not Found" });
});
// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});