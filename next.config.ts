import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'aqwwgfcfwcnnwccwwqvq.supabase.co' },
      { protocol: 'https', hostname: 'ddubuk.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'http', hostname: '*.kakaocdn.net' },
      { protocol: 'https', hostname: '*.kakaocdn.net' },
      { protocol: 'https', hostname: '*.daumcdn.net' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '*.unsplash.com' },
    ],
  },
}

export default nextConfig
