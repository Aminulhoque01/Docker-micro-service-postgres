// import cors from "cors";
// import * as dotenv from "dotenv";
// import express, { NextFunction, Request, Response } from "express";
// import morgan from "morgan";
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";
// import axios from "axios";
// import { configureRoutes } from "./utils";

// dotenv.config();

// const app = express();
// app.use(helmet());

// // Apply rate limiting middleware
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   handler: (req: Request, res: Response) => {
//     res.status(429).json({ message: "Too many requests, please try again later" });
//   },
// });

// // Apply middleware globally
// app.use(morgan("dev"));
// app.use(cors());
// app.use(express.json());
// app.use("/api", limiter);

// // Register routes (from your custom function or file)
// configureRoutes(app);

// // Health check route to ensure the gateway is working
// app.get("/api/health", (req, res) => {
//   res.json({ message: "API Gateway is running" });
// });

// // Example route with microservice call
// app.get("/api/product", async (req, res) => {
//   try {
//     const response = await axios.get("http://localhost:4002/product");
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error fetching product:", error);
//     res.status(500).json({ message: "Product service unavailable" });
//   }
// });

// // 404 handler - when no route matches
// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.status(404).json({ message: "Not Found" });
// });

// // Error handler - catches unhandled errors
// app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
//   if (err instanceof Error) {
//     console.error("Unhandled Error:", err.message); // Access 'message' safely
//     res.status(500).json({ message: "Internal server error" });
//   } else {
//     console.error("Unknown error occurred");
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

 

// const PORT = process.env.PORT || 8081;

// app.listen(PORT, () => {
//   console.log(`API Gateway is running on port ${PORT}`);
// });




import cors from "cors";
import * as dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import axios from "axios";
import { configureRoutes } from "./utils";

dotenv.config();

const app = express();
app.use(helmet());

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  handler: (req: Request, res: Response) => {
    res.status(429).json({ message: "Too many requests, please try again later" });
  },
});

// Apply middleware globally
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use("/api", limiter);

// Register routes (from your custom function or file)
configureRoutes(app);

// Health check route to ensure the gateway is working
app.get("/api/health", (req, res) => {
  res.json({ message: "API Gateway is running" });
});

// Example route with microservice call
app.get("/api/product", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:4002/product");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Product service unavailable" });
  }
});

// 404 handler - when no route matches
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Not Found" });
});

// Error handler - catches unhandled errors
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error) {
    console.error("Unhandled Error:", err.message); // Access 'message' safely
    res.status(500).json({ message: "Internal server error" });
  } else {
    console.error("Unknown error occurred");
    res.status(500).json({ message: "Internal server error" });
  }
});

// Process-level uncaughtException and unhandledRejection handler
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1); // Optional, exit with failure status
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1); // Optional, exit with failure status
});

// Configure and register routes dynamically
// export function configureRoutes(app: express.Application) {
//   app.get("/api/product", (req, res) => {
//     // Example route logic
//     res.json({ message: "Product route" });
//   });

//   app.get("/api/product/:id", (req, res) => {
//     // Example dynamic route logic
//     const { id } = req.params;
//     res.json({ message: `Fetching product with id ${id}` });
//   });

//   app.get("/api/inventories/:id/details", (req, res) => {
//     const { id } = req.params;
//     res.json({ message: `Fetching inventory details for id ${id}` });
//   });

//   // Add other routes as needed here...
// };

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
