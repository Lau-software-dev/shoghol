import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Starting MongoDB the first time can take a while (it downloads its binary once).
    hookTimeout: 120_000,
    testTimeout: 20_000,
    // One file at a time: each test file starts its own in-memory MongoDB.
    fileParallelism: false,
  },
});
