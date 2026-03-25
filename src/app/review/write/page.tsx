'use client'

import MediaUploader from '@/components/domain/review/MediaUploader'
import OptionSelector from '@/components/domain/review/OptionSelector'
import RatingSelector from '@/components/domain/review/RatingSelector'
import Image from 'next/image'
import { useState } from 'react'

export default function ReviewWritePage() {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')

  // 리뷰 등록
  const handleSubmit = () => {}

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex-col w-1/3 self-center">
        <div className="py-4">
          <button className="text-2xl p-2 cursor-pointer">←</button>
          <h1 className="inline text-2xl p-4 font-bold">리뷰작성</h1>
        </div>
        <div className="border rounded-xl mb-6 p-6 flex flex-row gap-4 text-gray-400">
          <div>
            <Image src="/icon.svg" width={50} height={50} alt="card image" />
          </div>
          <div className="flex-col">
            <div>장소명</div>
            <div>주소</div>
          </div>
        </div>
        <div className="text-xl font-bold">전체 평점</div>
        <div className="p-4">
          <RatingSelector rating={rating} setRating={setRating} />
        </div>
        <div className="text-xl font-bold py-4">보행 환경 체크</div>
        <div className="border rounded-xl mb-6 p-6 flex flex-col text-gray-400">
          <OptionSelector />
        </div>
        <div className="text-xl font-bold py-4">리뷰 내용</div>
        <div>
          <textarea
            name="content"
            rows={4}
            className="resize-none w-full py-4"
            placeholder=" 뚜벅이 여행자에게 도움이 될 보행환경, 접근성, 추천 팁 등을 자유롭게 작성해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="text-xl font-bold py-4">사진/영상 첨부</div>
        <div className="mb-6">
          <MediaUploader />
        </div>
        <button
          className="w-full bg-black text-white py-3 rounded-lg mb-6 cursor-pointer"
          onClick={handleSubmit}
        >
          리뷰 등록
        </button>
      </div>
    </div>
  )
}
