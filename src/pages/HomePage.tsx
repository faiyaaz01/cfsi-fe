import React, { useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { LatestNewsSection } from '../components/home/LatestNewsSection';
import { CoursesSection } from '../components/home/CoursesSection';
import { StudentPortalBanner } from '../components/home/StudentPortalBanner';
import { StatsSection } from '../components/home/StatsSection';
import { TrainingSection } from '../components/home/TrainingSection';
import { WhyChooseUsSection } from '../components/home/WhyChooseUsSection';
import { NoticePopup } from '../components/home/NoticePopup';
import { useWebContent } from '../context/WebContentContext';
import { SEOHead } from '../components/common/SEOHead';
import { getOrganizationSchema } from '../lib/seoSchemas';

export const HomePage: React.FC = () => {
  const { displaySettings, homePageConfig, fetchDisplaySettingsAndHome, fetchCourses, fetchTrainings } = useWebContent();

  useEffect(() => {
    void fetchDisplaySettingsAndHome();
    void fetchCourses();
    void fetchTrainings();
  }, [fetchDisplaySettingsAndHome, fetchCourses, fetchTrainings]);

  const showHero = homePageConfig?.showHero ?? true;
  const showNews = homePageConfig?.showNewsSection ?? true;
  const showCourses = homePageConfig?.showCoursesSection ?? true;
  const showPortal = (homePageConfig?.showPortalBanner ?? true) && (displaySettings?.studentPortalLogin ?? true);
  const showStats = homePageConfig?.showStatsSection ?? true;
  const showTraining = homePageConfig?.showTrainingSection ?? true;
  const showWhy = homePageConfig?.showWhyChooseUs ?? true;

  const orgSchema = getOrganizationSchema();

  return (
    <div className="space-y-0">
      <NoticePopup />
      <SEOHead
        title="Central Fire Safety Institute Vadodara"
        description="Central Fire Safety Institute (CFSI) Vadodara offers Government-recognized Diploma in Fire Safety, Sub-Fire Officer, and Health & Safety courses with 100% practical drills & placement support."
        keywords="fire safety institute vadodara, fire safety engineering gujarat, sub fire officer training, industrial safety diploma, CFSI vadodara, fire fighting courses fees"
        structuredData={orgSchema}
      />
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
