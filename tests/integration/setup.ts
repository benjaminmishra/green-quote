import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "child_process";

export default async function setup() {
  console.log("Starting PostgreSQL Testcontainer...");
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const uri = container.getConnectionUri();
  
  // Set the environment variable for Prisma
  process.env.DATABASE_URL = uri;
  
  // Use migrate deploy so that migration SQL (including reference data INSERTs) runs
  console.log("Running Prisma migrate deploy...");
  execSync("npx prisma migrate deploy", {
    env: {
      ...process.env,
      DATABASE_URL: uri,
    },
    stdio: "inherit",
  });

  // Generate client for the test environment
  execSync("npx prisma generate", {
    env: {
      ...process.env,
      DATABASE_URL: uri,
    },
    stdio: "inherit",
  });

  return async () => {
    console.log("Stopping PostgreSQL Testcontainer...");
    await container.stop();
  };
}
