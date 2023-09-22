/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/@:username",
        destination: "/user/:username",
      },
      {
        source: "/@:username/:id",
        destination: "/user/:username/:id",
      },
    ];
  },
  images: {
    domains: ["xg2x9irss5vqdb67.public.blob.vercel-storage.com"],
  },
};

module.exports = nextConfig;
