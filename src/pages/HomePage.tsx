import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { LatestNewsSection } from '../components/home/LatestNewsSection';
import { CoursesSection } from '../components/home/CoursesSection';
import { StudentPortalBanner } from '../components/home/StudentPortalBanner';
import { StatsSection } from '../components/home/StatsSection';
import { TrainingSection } from '../components/home/TrainingSection';
import { WhyChooseUsSection } from '../components/home/WhyChooseUsSection';
import { useWebContent } from '../context/WebContentContext';

export const HomePage: React.FC = () => {
  const { displaySettings } = useWebContent();

  return (
    <div className="space-y-0">
      <HeroSection />
      {displaySettings.newsTickerMarquee && <LatestNewsSection />}
      {displaySettings.coursesSection && <CoursesSection />}
      {displaySettings.studentPortalLogin && <StudentPortalBanner />}
      {displaySettings.placementStatsBar && <StatsSection />}
      {displaySettings.groundTrainingSection && <TrainingSection />}
      <WhyChooseUsSection />
    </div>
  );
};
