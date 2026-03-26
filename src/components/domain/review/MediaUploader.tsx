'use client'

import { Camera, X } from 'lucide-react'
import { useRef, useState } from 'react'

export default function MediaUploader({ supabase, onUpload, onRemove }: any) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [images, setImages] = useState<{ url: string; path: string }[]>([])
  const [uploading, setUploading] = useState(false)

  // 사진 첨부
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    const uploadedUrls: { url: string; path: string }[] = []

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`

      const { error } = await supabase.storage
        .from('media-storage')
        .upload(fileName, file)
      if (error) {
        console.log(error)
        alert('파일 형식 및 용량을 확인해주세요')
        continue
      }

      const { data } = supabase.storage
        .from('media-storage')
        .getPublicUrl(fileName)

      uploadedUrls.push({
        url: data.publicUrl,
        path: fileName,
      })
    }
    setImages((prev) => [...prev, ...uploadedUrls])
    onUpload(uploadedUrls)
    setUploading(false)
    e.target.value = ''
  }

  // 사진 첨부 취소
  const handleRemove = async (index: number) => {
    const target = images[index]

    // 1. storage에서 삭제
    const { data, error } = await supabase.storage
      .from('media-storage')
      .remove([target.path])
    console.log(error)
    if (error) {
      alert('삭제 실패')
      return
    }

    // 2. state에서 제거
    const updated = images.filter((_, i) => i !== index)
    setImages(updated)

    // 3. 부모에도 반영
    onRemove(updated)
  }

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="w-full border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer text-gray-500"
      >
        <Camera />
        {uploading
          ? '업로드 중...'
          : '사진을 업로드하세요(jpg, png / 30MB까지)'}
      </div>

      <input
        type="file"
        ref={inputRef}
        multiple
        accept="jpg, jpeg, png"
        hidden
        onChange={handleUpload}
      />

      <div className="flex gap-2 mt-3">
        {images.map((item, i) => (
          <div key={i} className="relative">
            <img src={item.url} className="w-16 h-16 object-cover rounded-md" />
            <button
              onClick={() => handleRemove(i)}
              className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
