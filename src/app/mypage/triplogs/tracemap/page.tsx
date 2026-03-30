'use client'

import TraceMap from '@/components/domain/review/Tracemap'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const supabase = createClient()

export default function TracemapPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const tripIdsParam = searchParams.get('tripIds') || ''
  const tripIds = tripIdsParam.split(',').filter(Boolean)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
    }
    getUser()
  }, [])

  return (
    <>
      <div
        style={{
          width: '100vw',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
        }}
      >
        {userId && tripIds.length > 0 && (
          <TraceMap userId={userId} tripIds={tripIds} />
        )}
      </div>
    </>
  )
}
