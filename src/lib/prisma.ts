import { PrismaClient } from "../../generated/prisma";

// Add PrismaClient to the NodeJS global type
declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // Optimize connection pool for serverless environment
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// For Vercel serverless environment, we need to handle connection differently
let prisma: PrismaClient;

// Check if we're in production (Vercel) or development
if (process.env.NODE_ENV === "production") {
  // In production, create a new instance each time
  prisma = prismaClientSingleton();
} else {
  // In development, use global to persist connection across hot reloads
  if (!globalThis.prisma) {
    globalThis.prisma = prismaClientSingleton();
  }
  prisma = globalThis.prisma;
}

export default prisma;
