import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import AuthGuard from "@/components/AuthGuard";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const FormsPage = lazy(() => import("@/pages/FormsPage"));
const BuilderPage = lazy(() => import("@/pages/BuilderPage"));
const ResponsesPage = lazy(() => import("@/pages/ResponsesPage"));
const PublicFormPage = lazy(() => import("@/pages/PublicFormPage"));
const FormPreviewPage = lazy(() => import("@/pages/FormPreviewPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#f5f5f5]">
      <div className="neu rounded-2xl p-6 flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-green-700 animate-bounce" />
        <span className="text-sm text-gray-500 font-medium">Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public form — no auth, no sidebar */}
          <Route path="/f/:shareToken" element={<PublicFormPage />} />

          {/* Auth route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected admin routes */}
          <Route element={<AuthGuard />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/forms" element={<FormsPage />} />
              <Route path="/forms/:formId/edit" element={<BuilderPage />} />
              <Route path="/forms/:formId/preview" element={<FormPreviewPage />} />
              <Route path="/responses" element={<ResponsesPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
