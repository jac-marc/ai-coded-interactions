import { createRequire } from 'module';

// 1. Setup 'require' so we can load the CommonJS next-pwa package
const require = createRequire(import.meta.url);

// 2. Initialize the PWA wrapper
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in local dev
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // webpack: (config) => {
  //   return config;
  // },
};

// 3. Wrap the config with PWA
export default withPWA(nextConfig);
