import { AuthProvider, AuthGuard, GuestGuard } from './context/AuthContext';
import { UsersPage } from './pages/UsersPage';
import { PortalPage } from './pages/PortalPage';
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
      <Router><AuthProvider>
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
            <Route path="contact" element={<ContactPage />} />
            {/* Unified Combined Login Portal (Admin & Student) */}
            <Route path="student-login" element={<Navigate to="/login" replace />} />
            <Route element={<GuestGuard />}><Route path="login" element={<LoginPage />} /></Route>
            <Route element={<AuthGuard roles={['admin']} />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>
            <Route element={<AuthGuard roles={['teacher']} />}><Route path="teacher/dashboard" element={<PortalPage />} /></Route>
            <Route element={<AuthGuard roles={['student']} />}><Route path="student/dashboard" element={<PortalPage />} /></Route>
            <Route element={<AuthGuard roles={['admin', 'teacher']} />}><Route path="student-data" element={<StudentDataPage />} /></Route>
            <Route element={<AuthGuard />}><Route path="verify" element={<StudentVerificationPage />} /></Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider></Router>
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
