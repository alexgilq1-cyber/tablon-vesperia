import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);

    remotePatterns.push({
      protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
      hostname: supabaseUrl.hostname,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // Ignore invalid env values so the app can still boot in demo mode.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
