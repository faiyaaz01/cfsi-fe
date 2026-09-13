import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { LatestNewsSection } from '../components/home/LatestNewsSection';
import { CoursesSection } from '../components/home/CoursesSection';
import { StudentPortalBanner } from '../components/home/StudentPortalBanner';
import { StatsSection } from '../components/home/StatsSection';
import { TrainingSection } from '../components/home/TrainingSection';
import { WhyChooseUsSection } from '../components/home/WhyChooseUsSection';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <LatestNewsSection />
      <CoursesSection />
      <StudentPortalBanner />
      <StatsSection />
      <TrainingSection />
      <WhyChooseUsSection />
    </div>
  );
};
