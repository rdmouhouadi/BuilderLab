import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained .next/standalone output —
  // required for the Docker "runner" stage, which copies only this
  // folder instead of shipping the full node_modules in the final image.
  output: "standalone",
};

export default nextConfig;
