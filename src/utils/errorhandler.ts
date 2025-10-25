import httpStatus from "http-status";
import { Request, Response, NextFunction } from 'express';

const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API Not Found",
      },
    ],
  });
  next();
};

// Global error handler for serverless environment
const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Global error:', err);
  
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
    errorMessages: [
      {
        path: req.originalUrl,
        message: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong",
      },
    ],
  });
};

export {
  notFoundHandler,
  globalErrorHandler
};