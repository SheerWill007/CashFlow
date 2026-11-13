import { Advantages } from '@/components/landing/Advantages';
import { CategoryStrip } from '@/components/landing/CategoryStrip';
import { Cta } from '@/components/landing/Cta';
import { DailyFinance } from '@/components/landing/DailyFinance';
import { Faq } from '@/components/landing/Faq';
import { FeatureTour } from '@/components/landing/FeatureTour';
import { Footer } from '@/components/landing/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Navbar } from '@/components/landing/Navbar';
import { StatsBand } from '@/components/landing/StatsBand';
import { BackToTop } from '@/components/ui/BackToTop';
import { ScrollProgress } from '@/components/ui/ScrollProgress';

export default function LandingPage() {
  return (
    <div className="landing">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <CategoryStrip />
        <StatsBand />
        <DailyFinance />
        <FeatureTour />
        <HowItWorks />
        <Advantages />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
