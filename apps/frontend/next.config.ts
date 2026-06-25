import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Redireciona /api/* para o backend Vercel separado
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  // Necessário para upload de arquivos (currículos)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
    ],
  },
};

export default nextConfig;
