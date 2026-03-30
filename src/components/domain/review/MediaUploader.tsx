'use client'

import { useModalStore } from '@/store/useModalStore'
import { Camera, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type TempMediaItem = {
  file: File
  url: string
  path: string
}

type Props = {
  supabase: any
  onUpload: (files: { url: string; path: string }[]) => void
  onRemove: (files: { url: string; path: string }[]) => void
  onCleanup?: React.MutableRefObject<(() => Promise<void>) | undefined>
}

export default function TempMediaUploader({
  supabase,
  onUpload,
  onRemove,
  onCleanup,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { openModal } = useModalStore()
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<TempMediaItem[]>([])

  const MAX_SIZE = 20 * 1024 * 1024 // 20MB
  const MAX_COUNT = 5

  /** --- Cleanup for uploaded images if registration is cancelled --- */
  const cleanup = async () => {
    for (const img of images) {
      try {
        await supabase.storage.from('media-storage').remove([img.path])
      } catch (err) {
        console.error('임시 이미지 삭제 실패:', err)
      }
    }
  }

  useEffect(() => {
    if (onCleanup) {
      onCleanup.current = cleanup
    }
  }, [images, onCleanup])

  /** --- Upload handler --- */
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
      })
      validFiles.splice(remainingSlots)
    }

    if (validFiles.length === 0) return

    setUploading(true)
    const uploaded: TempMediaItem[] = []

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

        uploaded.push({ file, url: urlData.publicUrl, path: fileName })
      } catch (err) {
        console.error('이미지 업로드 실패:', err)
        openModal({
          type: 'alert',
          variant: 'danger',
          title: '업로드 실패',
          description: `${file.name} 업로드에 실패했습니다.`,
        })
      }
    }

    if (uploaded.length > 0) {
      setImages((prev) => [...prev, ...uploaded])
      onUpload(uploaded.map(({ url, path }) => ({ url, path })))
    }

    setUploading(false)
    e.target.value = ''
  }

  /** --- Remove handler --- */
  const handleRemove = async (path: string) => {
    const target = images.find((img) => img.path === path)
    if (!target) return

    try {
      await supabase.storage.from('media-storage').remove([target.path])
    } catch (err) {
      console.error('이미지 삭제 실패:', err)
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '첨부 취소 실패',
        description: '사진 첨부 취소에 실패했습니다.',
      })
    }

    const updated = images.filter((img) => img.path !== path)
    setImages(updated)
    onRemove(updated.map(({ url, path }) => ({ url, path })))
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
