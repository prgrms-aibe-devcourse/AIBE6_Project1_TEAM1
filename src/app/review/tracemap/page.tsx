'use client'

import TraceMap from '@/components/domain/review/Tracemap'
import GlobalHeader from '@/components/layout/GlobalHeader'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

const supabase = createClient()

export default function TracemapPage() {
  const [userId, setUserId] = useState<string | null>(null)

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
      <GlobalHeader />
      <div
        style={{
          width: '100vw',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
        }}
      >
        {userId && <TraceMap userId={userId} />}
      </div>
    </>
  )
}
