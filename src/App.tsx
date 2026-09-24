import { AuthProvider, AuthGuard, GuestGuard } from './context/AuthContext';
import { LeaderDashboardPage } from './pages/LeaderDashboardPage';
import { PortalPage } from './pages/PortalPage';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { NewsProvider } from './context/NewsContext';
import { StudentDataProvider } from './context/StudentDataContext';
import { WebContentProvider } from './context/WebContentContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ImageGalleryPage } from './pages/ImageGalleryPage';
import { VideoGalleryPage } from './pages/VideoGalleryPage';
import { CoursesPage } from './pages/CoursesPage';
import { NewsPage } from './pages/NewsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ContactPage } from './pages/ContactPage';
import { StudentDataPage } from './pages/StudentDataPage';
import { LoginPage } from './pages/LoginPage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { InstituteLoginPage } from './pages/InstituteLoginPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SlotAttendancePage } from './pages/SlotAttendancePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PageLoader } from './components/common/PageLoader';

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
        <PageLoader />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="mission" element={<Navigate to="/about#mission" replace />} />
              <Route path="gallery/images" element={<ImageGalleryPage />} />
              <Route path="gallery/videos" element={<VideoGalleryPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="courses/:slug" element={<CoursesPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="contact" element={<ContactPage />} />
              {/* Separate Login Portals (Student & Institute) */}
              <Route element={<GuestGuard />}>
                <Route path="student-login" element={<StudentLoginPage />} />
                <Route path="institute-login" element={<InstituteLoginPage />} />
                <Route path="login" element={<LoginPage />} />
              </Route>
              <Route element={<AuthGuard roles={['admin']} />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="dashboard/web-management" element={<Navigate to="/dashboard?tab=web" replace />} />
                <Route path="dashboard/leadership" element={<Navigate to="/dashboard?tab=users" replace />} />
                <Route path="users" element={<Navigate to="/dashboard?tab=users" replace />} />
              </Route>
              <Route element={<AuthGuard roles={['teacher']} />}><Route path="teacher/dashboard" element={<PortalPage />} /></Route>
              <Route element={<AuthGuard roles={['leader']} />}><Route path="leader/dashboard" element={<Navigate to="/student/dashboard" replace />} /></Route>
              <Route element={<AuthGuard roles={['student', 'leader']} />}><Route path="student/dashboard" element={<PortalPage />} /></Route>
              <Route element={<AuthGuard roles={['student', 'teacher', 'admin', 'leader']} />}><Route path="profile" element={<ProfilePage />} /></Route>
              <Route element={<AuthGuard roles={['admin', 'teacher', 'leader']} />}>
                <Route path="student-data" element={<StudentDataPage />} />
                <Route path="attendance/:date/:slot" element={<SlotAttendancePage />} />
                <Route path="dashboard/attendance/:date/:slot" element={<SlotAttendancePage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ConfirmProvider>
        <WebContentProvider>
          <NewsProvider>
            <StudentDataProvider>
              <AppContent />
            </StudentDataProvider>
          </NewsProvider>
        </WebContentProvider>
      </ConfirmProvider>
    </ThemeProvider>
  );
}
