'use client'

interface Props {
  rating: number
  setRating: (value: number) => void
}

export default function RatingSelector({ rating, setRating }: Props) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          className={`text-2xl cursor-pointer ${
            star <= rating ? 'text-black' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  )
}
