/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "10.10.7.103",
      },
      {
        protocol: "http",
        hostname: "10.10.7.103",
      },
      {
        protocol: "https",
        hostname: "asif7001.binarybards.online",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "35.183.138.114",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "35.183.138.114",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
