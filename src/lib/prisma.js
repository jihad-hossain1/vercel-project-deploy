import { PrismaClient } from "../../generated/prisma";

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
let prisma;

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

module.exports = prisma;
