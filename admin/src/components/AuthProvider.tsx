import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { adminFetch, apiFetch } from '../lib/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  subscriptionLevel: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'travel-admin-auth';

interface StoredAuthState {
  token: string;
  user: AuthUser;
}

const readStoredAuth = (): StoredAuthState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuthState;
  } catch (_error) {
    return null;
  }
};

const storeAuth = (state: StoredAuthState | null) => {
  if (!state) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    const stored = readStoredAuth();
    if (stored?.token) {
      setToken(stored.token);
      setUser(stored.user);
    }
  }, []);

  const fetchMe = useCallback(async (authToken: string): Promise<AuthUser> => {
    const response = await apiFetch('/api/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }

    const payload = await response.json();
    return payload.data as AuthUser;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthenticating(true);
      try {
        const response = await apiFetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const message = payload?.message || 'Login failed';
          throw new Error(message);
        }

        const payload = await response.json();
        const authToken = payload.data?.token;
        if (!authToken) {
          throw new Error('Missing token in response');
        }

        const currentUser = await fetchMe(authToken);
        console.log('Current User:', currentUser);
        if (!currentUser || currentUser.role !== 'admin') {
          throw new Error('Admin access required');
        }

        setToken(authToken);
        setUser(currentUser);
        storeAuth({ token: authToken, user: currentUser });
        navigate('/', { replace: true });
      } finally {
        setAuthenticating(false);
      }
    },
    [fetchMe, navigate]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    storeAuth(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticating,
    }),
    [user, token, login, logout, isAuthenticating]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
};
