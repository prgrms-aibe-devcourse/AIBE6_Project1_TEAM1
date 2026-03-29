import PlaceDetailPage from '@/components/domain/place-search/PlaceDetailPage'

interface SearchDetailRoutePageProps {
  params: Promise<{
    tripId: string
  }>
}

export default async function SearchDetailRoutePage({
  params,
}: SearchDetailRoutePageProps) {
  const { tripId } = await params
  const parsedTripId = Number(tripId)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <main className="mx-auto max-w-7xl px-4 py-4">
        {Number.isNaN(parsedTripId) ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              올바르지 않은 일정 경로입니다.
            </p>
          </section>
        ) : (
          <PlaceDetailPage tripId={parsedTripId} />
        )}
      </main>
    </div>
  )
}
