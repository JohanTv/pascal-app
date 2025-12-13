import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

const prismaClientSingleton = () => {
  // Prisma v7 requires an adapter for database connections
  // In production, use DATABASE_POOL_URL (port 6543) for faster pooled queries
  // In development, use DATABASE_URL (direct connection)
  const connectionString =
    process.env.NODE_ENV === "production" && process.env.DATABASE_POOL_URL
      ? process.env.DATABASE_POOL_URL
      : process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

  if (process.env.NODE_ENV === "development") {
    client.$on("query", (e: { params: unknown; duration: number }) => {
      console.log(`Params: ${e.params}`);
      console.log(`Duration: ${e.duration}ms`);
      console.log("---------------------------------");
    });
  }

  return client;
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
