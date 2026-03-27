import PlaceSearchSection from '@/components/domain/place-search/PlaceSearchSection'
import GlobalHeader from '@/components/layout/GlobalHeader'

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <GlobalHeader />
      <main className="mx-auto max-w-7xl px-4 py-4">
        <PlaceSearchSection />
      </main>
    </div>
  )
}
