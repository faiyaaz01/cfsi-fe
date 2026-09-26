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
  const { displaySettings, homePageConfig } = useWebContent();

  const showHero = homePageConfig?.showHero ?? true;
  const showNews = homePageConfig?.showNewsSection ?? true;
  const showCourses = homePageConfig?.showCoursesSection ?? true;
  const showPortal = (homePageConfig?.showPortalBanner ?? true) && (displaySettings?.studentPortalLogin ?? true);
  const showStats = homePageConfig?.showStatsSection ?? true;
  const showTraining = homePageConfig?.showTrainingSection ?? true;
  const showWhy = homePageConfig?.showWhyChooseUs ?? true;

  return (
    <div className="space-y-0">
      {showHero && <HeroSection />}
      {showNews && <LatestNewsSection />}
      {showCourses && <CoursesSection />}
      {showPortal && <StudentPortalBanner />}
      {showStats && <StatsSection />}
      {showTraining && <TrainingSection />}
      {showWhy && <WhyChooseUsSection />}
    </div>
  );
};
