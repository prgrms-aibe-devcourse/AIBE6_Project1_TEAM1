import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: [
      'aqwwgfcfwcnnwccwwqvq.supabase.co',
      'picsum.photos',
      'source.unsplash.com',
      'images.unsplash.com',
      'ddubuk.supabase.co',
    ],
  },
}

export default nextConfig
