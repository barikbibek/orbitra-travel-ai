import {
  createContext, useContext, useEffect,
  useState, ReactNode
} from 'react';
import { User } from '../types';
import { getMeApi, loginApi, logoutApi, registerApi } from '../api/auth.api';

interface AuthContextType {
  user:      User | null;
  loading:   boolean;
  login:     (email: string, password: string) => Promise<void>;
  register:  (name: string, email: string, password: string) => Promise<void>;
  logout:    () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount — check if user is already logged in via cookie
  useEffect(() => {
    getMeApi()
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginApi({ email, password });
    setUser(res.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await registerApi({ name, email, password });
    setUser(res.data.user);
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};