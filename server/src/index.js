import app from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";

if (env.jwtSecret.length < 32) {
  console.error("JWT_SECRET must contain at least 32 characters.");
  process.exit(1);
}

try {
  await connectToDatabase();
} catch (error) {
  console.error(
    "Could not connect to MongoDB. Check that the cluster is running, this machine's IP address is allowed in Atlas Network Access, and outbound access to MongoDB is available."
  );
  console.error(`Connection error: ${error.name || "Unknown error"}`);
  process.exitCode = 1;
  process.exit();
}

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}.`);
});
