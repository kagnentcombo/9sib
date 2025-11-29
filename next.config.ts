/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" }, // เผื่อโดเมนย่อยอื่นๆ ของ Google avatar
    ],
  },
};

module.exports = nextConfig;
