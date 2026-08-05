/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // fail the build on TypeScript errors
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
