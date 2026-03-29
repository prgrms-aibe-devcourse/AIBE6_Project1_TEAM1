import { useModalStore } from '@/store/useModalStore'
import { Camera, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type MediaItem = { id?: number; url: string; path: string; isNew?: boolean }

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
  const { openModal } = useModalStore()
  const [uploading, setUploading] = useState(false)

  const MAX_SIZE = 20 * 1024 * 1024 // 20MB
  const MAX_COUNT = 5

  // --- Cleanup function for newly uploaded images ---
  const cleanup = async () => {
    const newFiles = images.filter((img) => img.isNew)
    for (const f of newFiles) {
      await supabase.storage.from('media-storage').remove([f.path])
    }
  }

  useEffect(() => {
    if (onCleanup) {
      onCleanup.current = cleanup
    }
  }, [images])

  // --- Upload handler ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const validFiles = Array.from(files).filter((file) => {
      if (file.size > MAX_SIZE) {
        openModal({
          type: 'alert',
          variant: 'danger',
          title: '파일 용량 초과',
          description: `${file.name} 용량이 20MB를 초과했습니다.`,
          onConfirm: () => {},
        })
        return false
      }
      return true
    })

    const remainingSlots = MAX_COUNT - images.length
    if (validFiles.length > remainingSlots) {
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '업로드 제한',
        description: `최대 ${MAX_COUNT}개까지 업로드 가능합니다.`,
        onConfirm: () => {},
      })
      validFiles.splice(remainingSlots) // 남는 슬롯까지만 업로드
    }

    if (validFiles.length === 0) return

    setUploading(true)
    const uploaded: { url: string; path: string }[] = []

    for (const file of validFiles) {
      try {
        const ext = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('media-storage')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('media-storage')
          .getPublicUrl(fileName)

        uploaded.push({ url: urlData.publicUrl, path: fileName })
      } catch (err) {
        console.error('이미지 업로드 실패:', err)
        openModal({
          type: 'alert',
          variant: 'danger',
          title: '업로드 실패',
          description: `${file.name} 업로드에 실패했습니다.`,
          onConfirm: () => {},
        })
      }
    }

    if (uploaded.length > 0)
      onUpload(uploaded.map((f) => ({ ...f, isNew: true })))
    setUploading(false)
    e.target.value = ''
  }

  // --- Remove handler ---
  const handleRemove = (path: string) => {
    const updated = images.filter((img) => img.path !== path)
    onRemove(updated)
  }

  return (
    <div>
      {/* Upload button */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="w-full border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer text-gray-500"
      >
        <Camera />
        {uploading
          ? '업로드 중...'
          : '사진을 업로드하세요(jpg, png / 최대 20MB)'}
      </div>

      <input
        type="file"
        ref={inputRef}
        multiple
        accept="image/jpeg,image/jpg,image/png"
        hidden
        onChange={handleUpload}
      />

      {/* Uploaded images */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {images.map((item) => (
          <div key={item.path} className="relative w-16 h-16">
            <img
              src={item.url}
              className="w-full h-full object-cover rounded-md"
            />
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
