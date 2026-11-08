// `npm run dev:memory`: the backend on a throwaway in-memory MongoDB, for working without an Atlas account.
// Everything is lost when it stops. Uses a one-node replica set so transactions work, as on Atlas.
import { MongoMemoryReplSet } from "mongodb-memory-server";

const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
process.env.MONGO_URI = mongo.getUri("shoghol");
process.env.JWT_SECRET ||= "dev-only-secret-not-for-production";
console.log("[dev:memory] In-memory MongoDB running — data is lost when this stops.");

for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await mongo.stop();
    process.exit(0);
  });

await import("./server.js");
