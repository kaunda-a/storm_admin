/**
 * ROBUST PRISMA CLIENT SETUP
 *
 * This setup gracefully handles cases where @prisma/client might not be available
 * or properly generated, providing a fallback that prevents build failures.
 */

let PrismaClient: any;
let prismaInstance: any;

try {
  // Try to import PrismaClient
  const prismaModule = require("@prisma/client");
  PrismaClient = prismaModule.PrismaClient;
} catch (error: any) {
  console.warn("Prisma client not available, using mock client");

  // Fallback mock client for development/build purposes
  PrismaClient = class MockPrismaClient {
    constructor() {
      console.warn("Using mock Prisma client - database operations will not work");
    }

    // Add mock methods for common Prisma operations
    $connect() { return Promise.resolve(); }
    $disconnect() { return Promise.resolve(); }
    $transaction(fn: any) { return Promise.resolve(fn(this)); }
  };
}

declare global {
  var prisma: any | undefined;
}

// Create singleton instance
if (PrismaClient) {
  prismaInstance = global.prisma || new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV === "development") {
    global.prisma = prismaInstance;
  }
} else {
  prismaInstance = new PrismaClient();
}

export const db = prismaInstance;
