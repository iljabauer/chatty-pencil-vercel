import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';
const isApiOnlyMode = process.env.API_ONLY_MODE === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  //swcMinify: true,
  images: {
    unoptimized: true
  },
  
  // Configure output based on deployment mode
  // API-only production mode: no static export (serves API routes only)
  // Regular mode: export static files for bundling in iOS app
  ...(!(isProduction && isApiOnlyMode) && {
    output: "export"
  }),
  
  // In API-only production mode, configure for server-side API serving
  ...(isProduction && isApiOnlyMode && {
    // Disable trailing slash for API routes
    trailingSlash: false,
    // Ensure images work without static export
    images: {
      unoptimized: true,
      loader: 'custom',
      loaderFile: undefined
    }
  })
};

export default nextConfig;
