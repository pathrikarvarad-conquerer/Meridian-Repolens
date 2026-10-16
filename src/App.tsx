import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserModeProvider } from './context/UserModeContext';
import { ToastProvider } from './context/ToastContext';
import { EvidenceDrawerProvider } from './context/EvidenceDrawerContext';
import { RepoProvider } from './context/RepoContext';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { ProjectOverviewPage } from './pages/ProjectOverviewPage';
import { SetupDoctorPage } from './pages/SetupDoctorPage';
import { RecommendedIssuesPage } from './pages/RecommendedIssuesPage';
import { AssistantPage } from './pages/AssistantPage';
import { CodebaseGraphPage } from './pages/CodebaseGraphPage';
import { ExportGuidePage } from './pages/ExportGuidePage';
import { SettingsPage } from './pages/SettingsPage';
import { RepoReelsPage } from './pages/RepoReelsPage';
import { RunnerPage } from './pages/RunnerPage';

export default function App() {
  return (
    <ThemeProvider>
      <UserModeProvider>
        <ToastProvider>
          <EvidenceDrawerProvider>
            <RepoProvider>
              <BrowserRouter>
                <Routes>
                  {/* Home Landing Page */}
                  <Route path="/" element={<AppShell />}>
                    <Route index element={<HomePage />} />
                    <Route path="overview" element={<ProjectOverviewPage />} />
                    <Route path="reels" element={<RepoReelsPage />} />
                    <Route path="run" element={<RunnerPage />} />
                    <Route path="setup" element={<SetupDoctorPage />} />
                    <Route path="issues" element={<RecommendedIssuesPage />} />
                    <Route path="assistant" element={<AssistantPage />} />
                    <Route path="graph" element={<CodebaseGraphPage />} />
                    <Route path="export" element={<ExportGuidePage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    {/* Fallback to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </RepoProvider>
          </EvidenceDrawerProvider>
        </ToastProvider>
      </UserModeProvider>
    </ThemeProvider>
  );
}
