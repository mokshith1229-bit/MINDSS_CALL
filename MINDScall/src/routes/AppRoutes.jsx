import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import FormUpload from '../pages/FormUpload';
import RDReview from '../pages/RDReview';
import AutoAssignEmail from '../pages/AutoAssignEmail';
import Evaluation from '../pages/Evaluation';
import Meeting from '../pages/Meeting';
import Approval from '../pages/Approval';
import FinanceApproval from '../pages/FinanceApproval';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import PublicForm from '../pages/PublicForm';
import PublicReview from '../pages/PublicReview';
import PublicBatchReview from '../pages/PublicBatchReview';
import RMBatchReview from '../pages/RMBatchReview';
import PublicFinanceReview from '../pages/PublicFinanceReview';
import PublicTracking from '../pages/PublicTracking';
import Login from '../pages/Login';
import RDOngoingProjects from '../pages/RDOngoingProjects';
import PublicEvaluatorReview from '../pages/PublicEvaluatorReview';
import { authStore } from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authStore.getState().isAuthenticated);
  const location = useLocation();

  useEffect(() => {
    return authStore.subscribe((state) => {
      setIsAuthenticated(state.isAuthenticated);
    });
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth route */}
      <Route path="/login" element={<Login />} />

      {/* Public form route — no layout, no sidebar, no login */}
      <Route path="/form/:slug" element={<PublicForm />} />
      <Route path="/track" element={<PublicTracking />} />
      <Route path="/review/:token" element={<PublicReview />} />
      <Route path="/batch-review/:token" element={<PublicBatchReview />} />
      <Route path="/rm-batch-review/:token" element={<RMBatchReview />} />
      <Route path="/finance-review/:token" element={<PublicFinanceReview />} />
      <Route path="/evaluator-review/:token" element={<PublicEvaluatorReview />} />

      {/* Admin routes — wrapped in MainLayout AND ProtectedRoute */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="form-upload" element={<FormUpload />} />
        <Route path="rd-review" element={<RDReview />} />
        <Route path="auto-assign-email" element={<AutoAssignEmail />} />
        <Route path="evaluation" element={<Evaluation />} />
        <Route path="meeting" element={<Meeting />} />
        <Route path="approval" element={<Approval />} />
        <Route path="rd-ongoing-projects" element={<RDOngoingProjects />} />
        <Route path="finance-approval" element={<FinanceApproval />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
