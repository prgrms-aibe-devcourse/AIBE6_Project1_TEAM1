'use client'

import { Footprints, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AIResultCardProps {
  order: number
  name: string
  category: string
  desc: string
  duration: string
  walkInfo?: string | null
  transitFare?: number | null
}

export default function AIResultCard({
  order,
  name,
  category,
  desc,
  duration,
  walkInfo,
}: AIResultCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setImageLoading(true)
    setImageUrl(null)

    fetch(`/api/ai-place-image?name=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setImageUrl(data.thumbnailUrl ?? null)
          setImageLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setImageLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [name])

  return (
    <div>
      {walkInfo && (
        <div className="flex items-center gap-2 py-2 px-2">
          <Footprints className="w-3 h-3 text-gray-300" />
          <span className="text-xs text-gray-400">{walkInfo}</span>
        </div>
      )}
      <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-sm transition">
        <div className="flex items-start gap-4">
          {/* 이미지 영역 */}
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
            {imageLoading ? (
              <div className="w-full h-full animate-pulse bg-gray-200 rounded-lg" />
            ) : imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setImageUrl(null)}
              />
            ) : (
              <MapPin className="w-6 h-6 text-gray-300" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900">
                {order}. {name}
              </span>
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {category}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            <p className="text-xs text-gray-400 mt-1">
              머무는 시간: {duration}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
