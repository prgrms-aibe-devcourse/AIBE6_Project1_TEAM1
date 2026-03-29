import { Camera, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type MediaItem = {
  id?: number
  url: string
  path: string
  isNew?: boolean
}

type Props = {
  supabase: any
  images: MediaItem[]
  onUpload: (files: { url: string; path: string }[]) => void
  onRemove: (files: { url: string; path: string }[]) => void
  onCleanup?: React.MutableRefObject<(() => Promise<void>) | undefined>
}

export default function EditMediaUploader({
  supabase,
  images,
  onUpload,
  onRemove,
  onCleanup,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  const MAX_SIZE = 20 * 1024 * 1024 // 20MB
  const MAX_COUNT = 5

  const cleanup = async () => {
    const newFiles = images.filter((img) => img.isNew)
    for (const f of newFiles) {
      await supabase.storage.from('media-storage').remove([f.path])
    }
  }

  useEffect(() => {
    if (onCleanup) {
      // 부모 ref에 cleanup 함수 전달
      onCleanup.current = cleanup
    }
  }, [images])

  // 업로드
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const validFiles = Array.from(files).filter((file) => {
      if (file.size > MAX_SIZE) {
        alert(`${file.name} 용량 초과`)
        return false
      }
      return true
    })
    const currentCount = images.length
    const remainingSlots = MAX_COUNT - currentCount
    if (validFiles.length > remainingSlots) {
      alert(`파일은 최대 ${MAX_COUNT}개까지 업로드 가능합니다.`)
      return
    }

    setUploading(true)

    const uploaded: { url: string; path: string }[] = []

    for (const file of validFiles) {
      const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`

      const { error } = await supabase.storage
        .from('media-storage')
        .upload(fileName, file)

      if (error) continue

      const { data } = supabase.storage
        .from('media-storage')
        .getPublicUrl(fileName)

      uploaded.push({
        url: data.publicUrl,
        path: fileName,
      })
    }

    onUpload(uploaded) // ✅ 부모에게만 전달

    setUploading(false)
    e.target.value = ''
  }

  // 삭제
  const handleRemove = (path: string) => {
    const updated = images.filter((img) => img.path !== path)

    onRemove(updated) // ✅ UI만 변경
  }

  return (
    <div>
      {/* 업로드 버튼 */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="w-full border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer text-gray-500"
      >
        <Camera />
        {uploading
          ? '업로드 중...'
          : '사진을 업로드하세요(jpg, png / 20MB까지)'}
      </div>

      <input
        type="file"
        ref={inputRef}
        multiple
        accept="jpg, jpeg, png"
        hidden
        onChange={handleUpload}
      />

      {/* 이미지 리스트 */}
      <div className="flex gap-2 mt-3">
        {images.map((item) => (
          <div key={item.path} className="relative">
            <img src={item.url} className="w-16 h-16 object-cover rounded-md" />
            <button
              onClick={() => handleRemove(item.path)}
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
