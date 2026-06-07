import { LiveTicker } from "@/components/layout/LiveTicker"
import { Hero } from "@/components/home/Hero"
import { LiveStats } from "@/components/home/LiveStats"
import { HowItWorks } from "@/components/home/HowItWorks"
import { FeaturesGrid } from "@/components/home/FeaturesGrid"
import { FeeTransparency } from "@/components/home/FeeTransparency"
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview"
import { Testimonials } from "@/components/home/Testimonials"
import { FinalCTA } from "@/components/home/FinalCTA"
import { Footer } from "@/components/layout/Footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-base text-text-primary">
      <LiveTicker />
      <main className="flex-1 flex flex-col w-full">
        <Hero />
        <LiveStats />
        <HowItWorks />
        <FeaturesGrid />
        <FeeTransparency />
        <LeaderboardPreview />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
