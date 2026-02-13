import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // อันเดิมของคุณ (เก็บไว้)
  reactCompiler: true,

  // 👇 อันใหม่ที่เพิ่มเข้ามา (ใส่ต่อกันในปีกกาเดียวกันเลย)
  serverExternalPackages: ["pdf-parse"], 
};

export default nextConfig;