'use client'

import { Camera } from 'lucide-react'
import { useRef, useState } from 'react'

export default function MediaUploader() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [images, setImages] = useState<string[]>([])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))

    setImages((prev) => [...prev, ...newImages])
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer text-gray-500"
      >
        <Camera className="flex items-center" />
        사진 또는 영상을 업로드하세요
      </div>

      <input
        type="file"
        ref={inputRef}
        multiple
        hidden
        onChange={handleUpload}
      />

      <div className="flex gap-2 mt-3">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            className="w-16 h-16 object-cover rounded-md"
          />
        ))}
      </div>
    </div>
  )
}
