import cors from "cors";
import * as dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { addToCart, getMyCart } from "./controller";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Health check route
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP" });
});

// Routes
app.post('/cart', addToCart);
app.get('/my-cart', getMyCart);

// 404 Not Found handler
app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Error handling middleware
interface ErrorWithStack extends Error {
  stack?: string;
}

app.use(
  (err: ErrorWithStack, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error occurred:", err.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
);

// Environment Variables
const port = Number(process.env.PORT) || 4006;
const serviceName = process.env.SERVICE_NAME || "Cart_Service";

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1); // Exit process after logging the error
});

// Handling unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1); // Exit process after logging the error
});

// Start the server
app.listen(port, "localhost", () => {
  console.log(`${serviceName} is running on port ${port}`);
});