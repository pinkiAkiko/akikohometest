/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zwafrwbcipqlzkobtato.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Instagram CDN domains for Graph API media URLs
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
  },
};

export default nextConfig;
