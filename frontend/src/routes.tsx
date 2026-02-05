import { Routes, Route } from "react-router-dom";
import {
  LoginPage,
  ProtectedRoute,
  ChangePasswordModal,
} from "./features/auth";
import { HomePage } from "./features/files";
import { SettingsPage } from "./features/settings";
import { PublicSharePage } from "./features/shares";
import { SetupWizardPage } from "./features/setup";
import { StoragePage } from "./features/storage";
import { TrashPage } from "./features/trash";
import { useAuth } from "./contexts/AuthContext";
import { useToast } from "./contexts/ToastProvider";
import { Layout } from "@/components/layout";

// =====================================================
// Route Configuration
// =====================================================

// Wrapper that shows ChangePasswordModal when needed
const AppContent = ({ children }: { children: React.ReactNode }) => {
  const { user, mustChangePassword, setupRequired, updateAuth } = useAuth();
  const toast = useToast();

  const handlePasswordChangeSuccess = (token: string, newUser: any) => {
    updateAuth(token, newUser);
    toast.success("Password berhasil diubah!");
  };

  return (
    <>
      {children}
      {user && (
        <ChangePasswordModal
          open={mustChangePassword && !setupRequired}
          currentUsername={user.username}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
    </>
  );
};

// =====================================================
// Route Configuration
// =====================================================

export const AppRoutes = () => {
  return (
    <AppContent>
      <Routes>
        {/* ===== Public Routes ===== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/share/:token" element={<PublicSharePage />} />

        {/* ===== Setup Routes ===== */}
        <Route path="/setup" element={<SetupWizardPage />} />

        {/* ===== Protected Routes ===== */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Files route with path parameter */}
        <Route
          path="/files/*"
          element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/storage"
          element={
            <ProtectedRoute>
              <Layout>
                <StoragePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/trash"
          element={
            <ProtectedRoute>
              <Layout>
                <TrashPage />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* ===== Add more routes below ===== */}
      </Routes>
    </AppContent>
  );
};

export default AppRoutes;
