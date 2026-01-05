import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { api } from "../api";
import i18n from "../i18n/config";
import { saveLanguage } from "../i18n/utils";

interface User {
  id: number;
  username: string;
  scope: string;
  locale: string;
  viewMode: string;
  hideDotfiles: boolean;
  singleClick: boolean;
  mustChangePassword: boolean;
  createdAt?: string;
  perm: {
    admin: boolean;
    execute: boolean;
    create: boolean;
    rename: boolean;
    modify: boolean;
    delete: boolean;
    share: boolean;
    download: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustChangePassword: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateAuth: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("auth-token");
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await api.get<User>("/me");
          setUser(userData);
          // Sync language from user profile
          if (userData.locale) {
            await i18n.changeLanguage(userData.locale);
            saveLanguage(userData.locale);
          }
        } catch {
          // Token invalid, clear it
          localStorage.removeItem("auth-token");
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.post<{ token: string; user: User }>("/login", {
      username,
      password,
    });

    localStorage.setItem("auth-token", response.token);
    setToken(response.token);
    setUser(response.user);
    // Sync language on login
    if (response.user.locale) {
      await i18n.changeLanguage(response.user.locale);
      saveLanguage(response.user.locale);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth-token");
    setToken(null);
    setUser(null);
    // Keep language preference in localStorage for next session
  }, []);

  // Called after password change to update token/user
  const updateAuth = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem("auth-token", newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      mustChangePassword: user?.mustChangePassword ?? false,
      login,
      logout,
      updateAuth,
    }),
    [user, token, isLoading, login, logout, updateAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
