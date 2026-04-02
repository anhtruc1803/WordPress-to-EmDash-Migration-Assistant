import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@wp2emdash/shared-types", "@wp2emdash/migration-core"],
  serverExternalPackages: ["fast-xml-parser"],
};

export default nextConfig;
