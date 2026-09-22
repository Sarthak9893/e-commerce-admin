import type { NextConfig } from "next";
import os from "os";

// Collect local IPv4 network addresses dynamically so any LAN IP is allowed
const localIps: string[] = ['localhost', '127.0.0.1', '192.168.1.23'];
try {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        localIps.push(net.address);
      }
    }
  }
} catch {
  // ignore
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    ...Array.from(new Set(localIps)),
    '192.168.1.*',
    '192.168.*.*',
    '10.*.*.*',
    '172.16.*.*',
  ],
};

export default nextConfig;
