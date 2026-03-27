import { create } from 'zustand'

type ReviewImage = {
  url: string
  path: string
  isNew: boolean
}

type Review = {
  id: number
  content: string
  rating: number
  place_id: number
  options: {
    slope: string
    width: string
    stairs: string
  }
  images: ReviewImage[]
}

type ReviewStore = {
  review: Review | null
  setReview: (review: Review) => void
  clearReview: () => void
}

export const useReviewStore = create<ReviewStore>((set) => ({
  review: null,
  setReview: (review) => set({ review }),
  clearReview: () => set({ review: null }),
}))
