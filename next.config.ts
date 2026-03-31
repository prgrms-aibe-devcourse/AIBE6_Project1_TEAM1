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
      'lh3.googleusercontent.com',
      'k.kakaocdn.net',
      't1.daumcdn.net',
      'img1.kakaocdn.net',
    ],
  },
}

export default nextConfig
