import { Request, Response, NextFunction } from "express";

// Global error handler
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error: ", err);  // Log error details

    if (err instanceof SyntaxError) {
        return res.status(400).json({ message: "Bad Request: Invalid JSON" });
    }

    return res.status(500).json({
        message: "Internal Server Error",
        error: err.message || "An unexpected error occurred.",
    });
   
};

export default errorHandler;
