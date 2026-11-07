// An in-memory MongoDB for the tests, so they need no Atlas account and never touch real data.
// It runs as a one-node replica set because the accept-offer route will need transactions.
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { createApp } from "../app.js";

let mongo;

export async function startTestDb() {
  process.env.JWT_SECRET = "test-secret";
  process.env.BCRYPT_ROUNDS = "4"; // fast in tests; production uses the default (12)
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongo.getUri());
  await mongoose.connection.syncIndexes();
}

export async function resetTestDb() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

export async function closeTestDb() {
  await mongoose.disconnect();
  await mongo?.stop();
}

/** A fresh app per test, so each one gets its own rate-limit counters. */
export const testApp = () => createApp({ trustProxy: 1 });
