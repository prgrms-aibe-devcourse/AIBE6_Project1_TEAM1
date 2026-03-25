'use client'

import { Camera } from 'lucide-react'
import { useRef, useState } from 'react'

export default function MediaUploader({ supabase, onUpload }: any) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    const uploadedUrls: string[] = []

    for (const file of Array.from(files)) {
      const fileName = `${Date.now()}-${file.name}`

      const { data, error } = await supabase.storage
        .from('media-storage')
        .upload(fileName, file)

      if (error) {
        console.error(error)
        continue
      }

      const { data: publicUrl } = supabase.storage
        .from('media-storage')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl.publicUrl)
    }
    setImages((prev) => [...prev, ...uploadedUrls])
    onUpload(uploadedUrls)
    setUploading(false)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer text-gray-500"
      >
        <Camera />
        {uploading ? '업로드 중...' : '사진 또는 영상을 업로드하세요'}
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
