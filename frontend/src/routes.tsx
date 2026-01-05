import { Routes, Route } from "react-router-dom";
import {
  LoginPage,
  ProtectedRoute,
  ChangePasswordModal,
} from "./features/auth";
import { HomePage } from "./features/files";
import { SettingsPage } from "./features/settings";
import { PublicSharePage } from "./features/shares";
import { useAuth } from "./contexts/AuthContext";
import { useToast } from "./contexts/ToastProvider";

// =====================================================
// Route Configuration
// =====================================================

// Wrapper that shows ChangePasswordModal when needed
const AppContent = ({ children }: { children: React.ReactNode }) => {
  const { user, mustChangePassword, updateAuth } = useAuth();
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
          open={mustChangePassword}
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

        {/* ===== Protected Routes ===== */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Files route with path parameter */}
        <Route
          path="/files/*"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />



        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />


        {/* ===== Add more routes below ===== */}
      </Routes>
    </AppContent>
  );
};

export default AppRoutes;
