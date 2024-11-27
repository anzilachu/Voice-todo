/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['www.google.com', 'lh3.googleusercontent.com'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      "fs": false,
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://voice-pro.vercel.app',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '523654605979-frv1vh91r720e3flmsodetcq2jacu6v4.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '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',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'bvNYQvStBw14BehY4smf4YzfU3/0azHfibn44U9CzVA=',
  },
};

module.exports = nextConfig;
