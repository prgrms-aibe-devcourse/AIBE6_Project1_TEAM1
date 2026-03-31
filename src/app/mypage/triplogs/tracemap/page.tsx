'use client'

import TraceMap from '@/components/domain/review/Tracemap'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

function TracemapContent() {
  const supabase = useMemo(() => createClient(), [])
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
  }, [supabase])

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

export default function TracemapPage() {
  return (
    <Suspense fallback={null}>
      <TracemapContent />
    </Suspense>
  )
}
