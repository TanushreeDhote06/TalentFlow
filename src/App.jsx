import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Layout from './components/Layout';
import ToastContainer from './components/Toast';
import JobsBoard from './features/jobs/JobsBoard';
import JobDetail from './features/jobs/JobDetail';
import CandidatesList from './features/candidates/CandidatesList';
import CandidateProfile from './features/candidates/CandidateProfile';
import AssessmentBuilder from './features/assessments/AssessmentBuilder';
import AssessmentPreview from './features/assessments/AssessmentPreview';

function AppContent() {
  useEffect(() => {
    // Initialize database on app load
    fetch('/api/init').catch(console.error);
  }, []);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/jobs" replace />} />
          <Route path="jobs" element={<JobsBoard />} />
          <Route path="jobs/:jobId" element={<JobDetail />} />
          <Route path="candidates" element={<CandidatesList />} />
          <Route path="candidates/:id" element={<CandidateProfile />} />
          <Route path="assessments/:jobId" element={<AssessmentBuilder />} />
          <Route path="assessments/:jobId/preview" element={<AssessmentPreview />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
