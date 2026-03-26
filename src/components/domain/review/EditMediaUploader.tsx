import { useEffect, useRef, useState } from 'react'

type MediaItem = {
  id?: number
  url: string
  path: string
  file_type?: string
  isNew: boolean
  toDelete?: boolean
}

export default function MediaUploader({
  supabase,
  initialMedia = [],
  onChange,
}: any) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [images, setImages] = useState<MediaItem[]>([])
  const [uploading, setUploading] = useState(false)

  // 🔹 초기 데이터 세팅 (수정 화면)
  useEffect(() => {
    const mapped = initialMedia.map((item: any) => ({
      id: item.id,
      url: item.file_url,
      path: extractPathFromUrl(item.file_url, 'media-storage') ?? '',
      file_type: item.file_type,
      isNew: false,
    }))
    setImages(mapped)
  }, [initialMedia])

  // 🔹 URL → path 추출
  function extractPathFromUrl(url: string, bucket: string) {
    const parts = url.split(`/storage/v1/object/public/${bucket}/`)
    if (parts.length < 2) return null
    return parts[1].split('?')[0]
  }

  // 🔹 업로드
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)

    const uploaded: MediaItem[] = []

    for (const file of Array.from(files)) {
      const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`

      const { error } = await supabase.storage
        .from('media-storage')
        .upload(fileName, file)

      if (error) {
        console.log(error)
        continue
      }

      const { data } = supabase.storage
        .from('media-storage')
        .getPublicUrl(fileName)

      uploaded.push({
        url: data.publicUrl,
        path: fileName,
        file_type: file.type,
        isNew: true,
      })
    }

    setImages((prev) => {
      const updated = [...prev, ...uploaded]
      onChange?.(updated)
      return updated
    })

    setUploading(false)
    e.target.value = ''
  }

  // 🔹 삭제
  const handleRemove = async (index: number) => {
    const target = images[index]

    if (target.isNew) {
      // 👉 새 파일 → 바로 storage 삭제
      await supabase.storage.from('media-storage').remove([target.path])

      const updated = images.filter((_, i) => i !== index)
      setImages(updated)
      onChange?.(updated)
    } else {
      // 👉 기존 파일 → 삭제 예약
      const updated = images.map((item, i) =>
        i === index ? { ...item, toDelete: true } : item,
      )

      setImages(updated)
      onChange?.(updated)
    }
  }

  // 🔹 수정 취소 시 cleanup
  const cleanupNewFiles = async () => {
    const newFiles = images.filter((item) => item.isNew)

    for (const file of newFiles) {
      await supabase.storage.from('media-storage').remove([file.path])
    }
  }

  // 🔹 UI에서 보여줄 것만 필터
  const visibleImages = images.filter((item) => !item.toDelete)

  return (
    <div>
      {/* 업로드 버튼 */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="w-full border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer text-gray-500"
      >
        {uploading ? '업로드 중...' : '사진을 업로드하세요'}
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
        {visibleImages.map((item, i) => (
          <div key={item.path} className="relative">
            <img src={item.url} className="w-16 h-16 object-cover rounded-md" />
            <button
              onClick={() => handleRemove(i)}
              className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
