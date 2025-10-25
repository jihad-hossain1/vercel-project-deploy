import cors from 'cors';
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import routes from './routes';
import { notFoundHandler, globalErrorHandler } from './utils/errorhandler';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req, res) => {
  res.send("B2C API v1");
});

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;