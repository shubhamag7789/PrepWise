/**
 * AppRoutes — lazy-loaded routes for better performance
 */
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Spinner from '@components/common/Spinner';
import NotFound from '@pages/errors/NotFound';

const Landing = lazy(() => import('@pages/Landing'));
const Login = lazy(() => import('@pages/auth/Login'));
const Register = lazy(() => import('@pages/auth/Register'));
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('@pages/dashboard/Dashboard'));
const Practice = lazy(() => import('@pages/dashboard/Practice'));
const MockInterview = lazy(() => import('@pages/dashboard/MockInterview'));
const InterviewSession = lazy(() => import('@pages/dashboard/InterviewSession'));
const InterviewFeedback = lazy(() => import('@pages/dashboard/InterviewFeedback'));
const Analytics = lazy(() => import('@pages/dashboard/Analytics'));
const PrepRoadmap = lazy(() => import('@pages/dashboard/PrepRoadmap'));
const ResumeAnalyzer = lazy(() => import('@pages/dashboard/ResumeAnalyzer'));
const Profile = lazy(() => import('@pages/dashboard/Profile'));

const PageLoader = () => <Spinner.Page />;

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
      <Route path="/dashboard/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
      <Route path="/dashboard/interview/:sessionId" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
      <Route path="/dashboard/interview/:sessionId/feedback" element={<ProtectedRoute><InterviewFeedback /></ProtectedRoute>} />
      <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/dashboard/roadmap" element={<ProtectedRoute><PrepRoadmap /></ProtectedRoute>} />
      <Route path="/dashboard/resume-analyzer" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
      <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
