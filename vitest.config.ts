import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["packages/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html"]
    }
  }
});

