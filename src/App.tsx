import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { NewsProvider } from './context/NewsContext';
import { StudentDataProvider } from './context/StudentDataContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { MissionPage } from './pages/MissionPage';
import { ImageGalleryPage } from './pages/ImageGalleryPage';
import { VideoGalleryPage } from './pages/VideoGalleryPage';
import { CoursesPage } from './pages/CoursesPage';
import { CareerPage } from './pages/CareerPage';
import { NewsPage } from './pages/NewsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ContactPage } from './pages/ContactPage';
import { StudentVerificationPage } from './pages/StudentVerificationPage';
import { StudentDataPage } from './pages/StudentDataPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <>
      <Toaster 
        theme={theme} 
        position="top-right" 
        richColors 
        closeButton 
      />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="mission" element={<MissionPage />} />
            <Route path="gallery/images" element={<ImageGalleryPage />} />
            <Route path="gallery/videos" element={<VideoGalleryPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:slug" element={<CoursesPage />} />
            <Route path="career" element={<CareerPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="verify" element={<StudentVerificationPage />} />
            <Route path="student-data" element={<StudentDataPage />} />
            {/* Unified Combined Login Portal (Admin & Student) */}
            <Route path="login" element={<LoginPage />} />
            <Route path="student-login" element={<Navigate to="/login?role=student" replace />} />
            <Route path="student/dashboard" element={<StudentDashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <NewsProvider>
        <StudentDataProvider>
          <AppContent />
        </StudentDataProvider>
      </NewsProvider>
    </ThemeProvider>
  );
}
