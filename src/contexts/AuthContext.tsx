import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const lastRequestTime = useRef<number>(0);
  const retryCount = useRef<number>(0);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      // Implement rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
        await wait(RATE_LIMIT_DELAY - timeSinceLastRequest);
      }
      lastRequestTime.current = Date.now();

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 429) {
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current += 1;
          const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount.current - 1);
          await wait(retryDelay);
          return checkAuth();
        }
        throw new Error('Too many requests. Please try again later.');
      }

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        retryCount.current = 0;
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!initialized && mounted) {
        await checkAuth();
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [initialized, checkAuth]);

  const handleApiRequest = async (url: string, options: RequestInit) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await wait(RATE_LIMIT_DELAY - timeSinceLastRequest);
    }
    lastRequestTime.current = Date.now();

    const response = await fetch(url, options);
    
    if (response.status === 429) {
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount.current - 1);
        await wait(retryDelay);
        return handleApiRequest(url, options);
      }
      throw new Error('Too many requests. Please try again later.');
    }

    retryCount.current = 0;
    return response;
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await handleApiRequest('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await handleApiRequest('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully');
  }, [navigate]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const response = await handleApiRequest('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      setLoading(true);
      const response = await handleApiRequest('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const value = React.useMemo(() => ({
    user,
    loading: loading && !initialized,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  }), [user, loading, initialized, login, register, logout, forgotPassword, resetPassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 