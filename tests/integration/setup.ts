import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "child_process";

export default async function setup() {
  console.log("Starting PostgreSQL Testcontainer...");
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const uri = container.getConnectionUri();
  
  // Set the environment variable for Prisma
  process.env.DATABASE_URL = uri;
  
  console.log("Running Prisma db push...");
  execSync("npx prisma db push --accept-data-loss", {
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
