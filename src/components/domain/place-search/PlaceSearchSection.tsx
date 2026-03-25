'use client'

import SearchBox from '@/components/layout/SearchBox'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PlaceList from './PlaceList'

interface Place {
  id: string
  name: string
  address: string
  category: string
  rating?: number
}

const dummyPlaces: Place[] = [
  {
    id: '1',
    name: '강남역',
    address: '서울 강남구 강남대로',
    category: '지하철역',
    rating: 4.3,
  },
  {
    id: '2',
    name: '코엑스',
    address: '서울 강남구 영동대로',
    category: '쇼핑몰',
    rating: 4.5,
  },
  {
    id: '3',
    name: '서울숲',
    address: '서울 성동구 뚝섬로',
    category: '공원',
    rating: 4.7,
  },
  {
    id: '4',
    name: '강남2',
    address: '서울 성동구 뚝섬ㅇㅇ로',
    category: '공원',
    rating: 4.7,
  },
]

export default function PlaceSearchSection() {
  const searchParams = useSearchParams()
  const queryFromUrl = searchParams.get('query') ?? ''

  const [keyword, setKeyword] = useState('')
  const [places, setPlaces] = useState<Place[]>([])

  const handleSearch = (searchKeyword: string) => {
    const trimmedKeyword = searchKeyword.trim()

    if (!trimmedKeyword) {
      setPlaces([])
      return
    }

    const filteredPlaces = dummyPlaces.filter((place) =>
      place.name.includes(trimmedKeyword),
    )

    setPlaces(filteredPlaces)
  }

  useEffect(() => {
    setKeyword(queryFromUrl)
    handleSearch(queryFromUrl)
  }, [queryFromUrl])

  return (
    <section className="space-y-4">
      <SearchBox
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(keyword)
          }
        }}
        placeholder="장소를 검색해보세요"
      />

      <PlaceList places={places} />
    </section>
  )
}
