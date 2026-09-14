import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { InfrastructureProject, EarlyWarningAlert } from './types';
import { MOCK_PROJECTS, generateEarlyWarnings } from './data/mockProjects';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { FloatingChatbot } from './components/common/FloatingChatbot';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { LoginView, UserSession } from './components/auth/LoginView';

// Lazy-loaded analytical views for ultra-responsive performance
const DashboardView = React.lazy(() => import('./components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const ProjectsTableView = React.lazy(() => import('./components/projects/ProjectsTableView').then(m => ({ default: m.ProjectsTableView })));
const EarlyWarningsView = React.lazy(() => import('./components/early-warnings/EarlyWarningsView').then(m => ({ default: m.EarlyWarningsView })));
const PredictiveAnalyticsView = React.lazy(() => import('./components/predictive/PredictiveAnalyticsView').then(m => ({ default: m.PredictiveAnalyticsView })));
const BenchmarkingView = React.lazy(() => import('./components/benchmarking/BenchmarkingView').then(m => ({ default: m.BenchmarkingView })));
const ScenarioAnalysisView = React.lazy(() => import('./components/scenario/ScenarioAnalysisView').then(m => ({ default: m.ScenarioAnalysisView })));
const InterventionsView = React.lazy(() => import('./components/interventions/InterventionsView').then(m => ({ default: m.InterventionsView })));
const DataQualityView = React.lazy(() => import('./components/quality/DataQualityView').then(m => ({ default: m.DataQualityView })));
const DataImportView = React.lazy(() => import('./components/import/DataImportView').then(m => ({ default: m.DataImportView })));
const UserManagementView = React.lazy(() => import('./components/users/UserManagementView').then(m => ({ default: m.UserManagementView })));
const AiAssistantView = React.lazy(() => import('./components/assistant/AiAssistantView').then(m => ({ default: m.AiAssistantView })));
const SettingsView = React.lazy(() => import('./components/settings/SettingsView').then(m => ({ default: m.SettingsView })));

// Loading Spinner for Code-Split Modules
function ModuleLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-10 h-10 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading module...</span>
    </div>
  );
}

// Role-Based Route Guard
function RoleGuard({
  userRole,
  allowedRoles,
  children
}: {
  userRole: string;
  allowedRoles: string[];
  children: React.ReactNode;
}) {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

// Main App Inner Content with Router Hooks
function AppContent({
  currentUser,
  onLogout
}: {
  currentUser: UserSession;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Application Data State
  const [projects, setProjects] = useState<InfrastructureProject[]>(MOCK_PROJECTS);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<InfrastructureProject | null>(null);
  const [targetModuleProjectId, setTargetModuleProjectId] = useState<string>(MOCK_PROJECTS[0]?.id || '');

  // Current active view derived from pathname
  const activeView = useMemo(() => {
    const path = location.pathname.replace(/^\//, '') || 'dashboard';
    return path;
  }, [location.pathname]);

  // Derived Alerts
  const alerts = useMemo(() => generateEarlyWarnings(projects), [projects]);
  const criticalCount = alerts.filter(a => a.riskLevel === 'CRITICAL').length;
  const highRiskCount = alerts.filter(a => a.riskLevel === 'HIGH').length;

  // Handle Navigation by Route
  const handleNavigate = (view: string) => {
    const route = view === 'dashboard' ? '/dashboard' : `/${view}`;
    navigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Project Selection for Detail Inspection Modal
  const handleSelectProject = (project: InfrastructureProject) => {
    setSelectedProjectForDetail(project);
    setTargetModuleProjectId(project.id);
  };

  // Handle Direct Navigation to Specific Analytical Module for a Project
  const handleNavigateToModule = (view: string, projectId: string) => {
    setSelectedProjectForDetail(null);
    setTargetModuleProjectId(projectId);
    handleNavigate(view);
  };

  const handleResetData = () => {
    setProjects(MOCK_PROJECTS);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f8] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-purple-600 selection:text-white transition-colors duration-200">
      {/* Sleek Top Navigation Header */}
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenSearch={() => handleNavigate('projects')}
        criticalCount={criticalCount}
        warningCount={highRiskCount}
        currentUser={currentUser}
        onLogout={onLogout}
        projects={projects}
        onSelectProject={handleSelectProject}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Animated & Independent Scroll Sidebar */}
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          criticalCount={criticalCount}
          highRiskCount={highRiskCount}
          currentUserRole={currentUser.role}
        />

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full bg-[#f8f9fc] dark:bg-[#0b0f19] transition-colors duration-200">
          <Suspense fallback={<ModuleLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route
                path="/dashboard"
                element={
                  <DashboardView
                    projects={projects}
                    onSelectProject={handleSelectProject}
                    onNavigate={handleNavigate}
                  />
                }
              />

              <Route
                path="/projects"
                element={
                  <ProjectsTableView
                    projects={projects}
                    onSelectProject={handleSelectProject}
                    onNavigate={handleNavigate}
                  />
                }
              />

              <Route
                path="/early-warnings"
                element={
                  <EarlyWarningsView
                    alerts={alerts}
                    projects={projects}
                    onSelectProject={handleSelectProject}
                    onNavigate={handleNavigate}
                  />
                }
              />

              <Route
                path="/predictive"
                element={
                  <PredictiveAnalyticsView
                    projects={projects}
                    selectedProjectId={targetModuleProjectId}
                    onSelectProject={handleSelectProject}
                    onNavigate={handleNavigate}
                  />
                }
              />

              <Route
                path="/benchmarking"
                element={
                  <RoleGuard userRole={currentUser.role} allowedRoles={['Admin', 'Project Tracker']}>
                    <BenchmarkingView
                      projects={projects}
                      selectedProjectId={targetModuleProjectId}
                      onSelectProject={handleSelectProject}
                      onNavigate={handleNavigate}
                    />
                  </RoleGuard>
                }
              />

              <Route
                path="/scenario"
                element={
                  <RoleGuard userRole={currentUser.role} allowedRoles={['Admin', 'Project Tracker']}>
                    <ScenarioAnalysisView
                      projects={projects}
                      selectedProjectId={targetModuleProjectId}
                      onSelectProject={handleSelectProject}
                      onNavigate={handleNavigate}
                    />
                  </RoleGuard>
                }
              />

              <Route
                path="/interventions"
                element={
                  <RoleGuard userRole={currentUser.role} allowedRoles={['Admin', 'Project Tracker']}>
                    <InterventionsView
                      projects={projects}
                      selectedProjectId={targetModuleProjectId}
                      onSelectProject={handleSelectProject}
                      onNavigate={handleNavigate}
                    />
                  </RoleGuard>
                }
              />

              <Route
                path="/data-quality"
                element={
                  <DataQualityView
                    projects={projects}
                    onSelectProject={handleSelectProject}
                  />
                }
              />

              <Route
                path="/data-import"
                element={
                  <RoleGuard userRole={currentUser.role} allowedRoles={['Admin']}>
                    <DataImportView
                      onImportSuccess={(newProjects) => {
                        setProjects(prevProjects => {
                          const projectMap = new Map<string, InfrastructureProject>();
                          prevProjects.forEach(p => projectMap.set(p.projectCode || p.id, p));
                          newProjects.forEach(p => projectMap.set(p.projectCode || p.id, p));
                          return Array.from(projectMap.values());
                        });
                      }}
                      onNavigate={handleNavigate}
                    />
                  </RoleGuard>
                }
              />

              <Route
                path="/users"
                element={
                  <RoleGuard userRole={currentUser.role} allowedRoles={['Admin']}>
                    <UserManagementView currentUser={currentUser} />
                  </RoleGuard>
                }
              />

              <Route
                path="/assistant"
                element={
                  <AiAssistantView
                    projects={projects}
                    onSelectProject={handleSelectProject}
                    onNavigate={handleNavigate}
                  />
                }
              />

              <Route
                path="/settings"
                element={
                  <RoleGuard userRole={currentUser.role} allowedRoles={['Admin']}>
                    <SettingsView onResetData={handleResetData} />
                  </RoleGuard>
                }
              />

              {/* Backward compatibility redirects for moved entities */}
              <Route path="/milestones" element={<Navigate to="/projects" replace />} />
              <Route path="/issues" element={<Navigate to="/projects" replace />} />
              <Route path="/drivers" element={<Navigate to="/predictive" replace />} />
              <Route path="/reports" element={<Navigate to="/dashboard" replace />} />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Project Deep-Dive Modal */}
      {selectedProjectForDetail && (
        <ProjectDetailModal
          project={selectedProjectForDetail}
          onClose={() => setSelectedProjectForDetail(null)}
          onNavigateToModule={handleNavigateToModule}
        />
      )}

      {/* Global AI Floating Chatbot Bubble */}
      <FloatingChatbot projects={projects} activeProject={selectedProjectForDetail} />
    </div>
  );
}

// Root Application Component with Authentication & Providers
export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem('nirmaanx_auth_user') || localStorage.getItem('paimana_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (user: UserSession) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('nirmaanx_auth_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save session to localStorage', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('nirmaanx_auth_user');
      localStorage.removeItem('paimana_auth_user');
    } catch (e) {
      console.warn('Failed to clear session from localStorage', e);
    }
  };

  return (
    <ThemeProvider>
      {!currentUser ? (
        <LoginView onLogin={handleLogin} />
      ) : (
        <BrowserRouter>
          <AppContent currentUser={currentUser} onLogout={handleLogout} />
        </BrowserRouter>
      )}
    </ThemeProvider>
  );
}
