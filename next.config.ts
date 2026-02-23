const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'builddrop.vercel.app']
    }
  }
}

export default nextConfig