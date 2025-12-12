import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.SHADOW_DATABASE_URL,
});

const prismaClientSingleton = () => {
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
