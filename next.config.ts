import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  
  experimental: {
    reactCompiler: true,
  },

 
  serverExternalPackages: ["pdf-parse"], 
  
 
  output: 'standalone',
};

export default nextConfig;


