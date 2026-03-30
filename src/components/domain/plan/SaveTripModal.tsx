'use client'

import { X, Upload, ImageIcon, Loader2, Hash } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useModalStore } from '@/store/useModalStore'
import { createClient } from '@/utils/supabase/client'

interface SaveTripModalProps {
  onClose: () => void
  onSave: (
    title: string,
    startDate: string,
    endDate: string,
    isPublic: boolean,
    imgUrl: string,
    tags: string,
  ) => Promise<void>
  totalDays: number // 자동으로 종료일을 계산하기 위해 추가
  userId: string | null // 이미지 업로드 경로 생성을 위해 추가
  initialData?: {
    // 기존 정보를 불러올 때 초기값 세팅용
    title: string
    startDate: string
    endDate: string
    isPublic: boolean
    imgUrl?: string
    tags?: string
  }
}

export default function SaveTripModal({
  onClose,
  onSave,
  totalDays,
  userId,
  initialData,
}: SaveTripModalProps) {
  const { openModal } = useModalStore()
  const [title, setTitle] = useState(initialData?.title || '')
  // 날짜를 YYYY-MM-DD 형태로 기본값 세팅
  const [startDate, setStartDate] = useState(
    () => initialData?.startDate || new Date().toISOString().split('T')[0],
  )
  const [endDate, setEndDate] = useState(
    () => initialData?.endDate || new Date().toISOString().split('T')[0],
  )
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true)
  const [imgUrl, setImgUrl] = useState(initialData?.imgUrl || '')
  const [tags, setTags] = useState(initialData?.tags || '')
  // 태그들을 배열로 관리하기 위한 상태
  const [tagList, setTagList] = useState<string[]>(() => {
    if (!initialData?.tags) return []
    // 기존 데이터가 있으면 공백이나 #으로 분리해서 배열로 변환
    return initialData.tags
      .split(/[#\s,]+/)
      .filter(Boolean)
      .map(t => t.replace(/^#/, ''))
  })
  const [tagInput, setTagInput] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 시작일이 바뀌거나 총 일수(Day 탭 개수)가 바뀌면 자동으로 종료일을 계산합니다.
  useEffect(() => {
    if (!startDate || totalDays < 1) return

    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + (totalDays - 1))

    setEndDate(end.toISOString().split('T')[0])
  }, [startDate, totalDays])

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      // 1. 파일 이름 생성 (중복 방지를 위해 timestamp 추가)
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // 2. Supabase Storage 'tripTitleImages' 버킷에 업로드
      const { error: uploadError } = await supabase.storage
        .from('tripTitleImages')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 3. 업로드된 파일의 Public URL 가져오기
      const { data } = supabase.storage
        .from('tripTitleImages')
        .getPublicUrl(filePath)

      setImgUrl(data.publicUrl)
    } catch (error: any) {
      console.error('이미지 업로드 실패:', error.message)
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '이미지 업로드 실패',
        description: '이미지를 서버에 기록하는 도중 문제가 생겼습니다.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  // 태그 추가 로직
  const addTag = (value: string) => {
    const trimmed = value.trim().replace(/^#/, '')
    if (trimmed && !tagList.includes(trimmed)) {
      setTagList([...tagList, trimmed])
    }
    setTagInput('')
  }

  // 태그 삭제 로직
  const removeTag = (index: number) => {
    setTagList(tagList.filter((_, i) => i !== index))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && tagList.length > 0) {
      removeTag(tagList.length - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // 최소한의 방어 로직 (빈 제목 막기)
    if (!title.trim()) {
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '입력 확인',
        description: '여행 제목을 입력해주세요.',
      })
      return
    }

    // 시작일/종료일 검증
    if (new Date(startDate) > new Date(endDate)) {
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '날짜 확인',
        description: '종료일은 시작일보다 빠를 수 없습니다.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      // 태그 배열을 공백으로 구분된 문자열로 변환 (DB 저장용)
      const tagsString = tagList.map(t => `#${t}`).join(' ')
      // 부모 컴포넌트(Page)가 넘겨준 실제 DB 저장 함수 호출
      await onSave(title, startDate, endDate, isPublic, imgUrl, tagsString)
      onClose() // 저장이 완전히 성공하면 모달 닫기
    } catch (error) {
      console.error(error)
      // 에러 처리는 부모 함수에서 이미 alert를 띄워주니 굳이 추가하지 않아도 됨
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    // 배경을 불투명하게 만들고 컴포넌트를 띄웁니다.
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
            여행 상세 정보 저장
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 정보 입력 Form 범위 */}
        <form
          onSubmit={handleSubmit}
          className="p-5 flex flex-col gap-6 bg-gray-50/50 dark:bg-gray-900/50 max-h-[80vh] overflow-y-auto"
        >
          {/* 대표 이미지 설정 섹션 (업로드 방식) */}
          <div className="flex flex-col gap-3">
            <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" /> 대표 이미지 설정
            </label>
            
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`group relative w-full h-40 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50/10 dark:hover:bg-purple-900/20 ${isUploading ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              {imgUrl ? (
                <>
                  <img
                    src={imgUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[13px] font-bold flex items-center gap-2">
                      <Upload className="w-4 h-4" /> 이미지 변경
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-full group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30 transition-colors">
                    <Upload className="w-6 h-6 group-hover:text-purple-500 dark:group-hover:text-purple-400" />
                  </div>
                  <span className="text-[12px] font-medium">여행을 대표할 사진을 올려주세요</span>
                  <span className="text-[10px] text-gray-300 dark:text-gray-600">최대 30MB / 이미지 파일만 가능</span>
                </div>
              )}

              {/* 로딩 표시 */}
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-spin mb-2" />
                  <span className="text-[12px] font-bold text-purple-600 dark:text-purple-400">업로드 중...</span>
                </div>
              )}
            </div>
            
            <input 
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="title"
              className="text-[13px] font-bold text-gray-700 dark:text-gray-300"
            >
              어떤 여행을 만들어볼까요?{' '}
              <span className="text-purple-600 dark:text-purple-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 우리들의 완벽한 제주 여행"
              className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[14px] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all"
              autoFocus
            />
          </div>

          {/* 해시태그 입력 섹션 추가 */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tag-input"
              className="text-[13px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"
            >
              <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" /> 태그 설정
            </label>
            
            <div className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all shadow-sm flex flex-wrap gap-1.5 min-h-[52px] items-center">
              {tagList.map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-[12px] font-bold rounded-lg border border-purple-100 dark:border-purple-800/50 group/tag"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="hover:text-purple-800 dark:hover:text-purple-100 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                id="tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => addTag(tagInput)}
                placeholder={tagList.length === 0 ? "태그를 입력하고 엔터나 스페이스를 눌러보세요!" : ""}
                className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-[14px] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 py-1"
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              * 엔터, 스페이스, 혹은 쉼표(,)를 눌러 태그를 완성할 수 있습니다.
            </p>
          </div>

          <div className="flex gap-4 w-full">
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                htmlFor="startDate"
                className="text-[13px] font-bold text-gray-700 dark:text-gray-300"
              >
                가는 날
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[14px] text-gray-900 dark:text-gray-100 shadow-sm transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                htmlFor="endDate"
                className="text-[13px] font-bold text-gray-700 dark:text-gray-300"
              >
                오는 날
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate} // 최소 시작날짜와 맞춰줌
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[14px] text-gray-900 dark:text-gray-100 shadow-sm transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100">
                내 일정 공개하기
              </span>
              <span className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                다른 유저들이 내 일정을 참고할 수 있게 허용합니다.
              </span>
            </div>
            {/* 토글 스위치 형태의 체크박스 구현 */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 dark:peer-checked:bg-purple-500"></div>
            </label>
          </div>

          {/* 하단 완료/강제 버튼들 */}
          <div className="flex gap-2 justify-end mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-3 text-[14px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-3 text-[14px] font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm flex items-center justify-center min-w-[110px]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '저장 완료'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
