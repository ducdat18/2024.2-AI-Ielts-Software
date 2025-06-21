import { useState, useEffect, useCallback } from 'react';
import type { User, LoginRequest } from '@/types';
import { authAPI } from '@/api/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: 'user' | 'admin' | null;
  userName: string | null;
  userEmail: string | null;
}

// Singleton pattern để share state across components
let globalAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  userRole: null,
  userName: null,
  userEmail: null,
};

let authStateListeners: Set<(state: AuthState) => void> = new Set();

const notifyListeners = (newState: AuthState) => {
  globalAuthState = newState;
  authStateListeners.forEach((listener) => listener(newState));
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(globalAuthState);

  // Subscribe to global state changes
  useEffect(() => {
    const listener = (newState: AuthState) => {
      setAuthState(newState);
    };

    authStateListeners.add(listener);

    return () => {
      authStateListeners.delete(listener);
    };
  }, []);

  // Check authentication status
  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole') as
      | 'user'
      | 'admin'
      | null;
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');

    const newState: AuthState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      userRole: null,
      userName: null,
      userEmail: null,
    };

    if (token && userRole && userEmail) {
      newState.user = {
        userId: localStorage.getItem('userId') || 'current-user-id',
        email: userEmail,
        firstName: userName?.split(' ')[0] || '',
        lastName: userName?.split(' ')[1] || '',
        userRole,
        dateOfBirth: localStorage.getItem('dateOfBirth') || '',
        registrationDate:
          localStorage.getItem('registrationDate') || new Date().toISOString(),
        country: localStorage.getItem('country') || '',
      } as User;

      newState.isAuthenticated = true;
      newState.userRole = userRole;
      newState.userName = userName;
      newState.userEmail = userEmail;
    }

    notifyListeners(newState);
  }, []);

  // Initialize auth state on first mount
  useEffect(() => {
    if (globalAuthState.isLoading) {
      checkAuthStatus();
    }
  }, [checkAuthStatus]);

  const login = useCallback(async (credentials: LoginRequest) => {
    notifyListeners({ ...globalAuthState, isLoading: true });

    try {
      const response = await authAPI.login(credentials);

      // Store auth data
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('userRole', response.user.userRole);
      localStorage.setItem('userEmail', response.user.email);
      localStorage.setItem(
        'userName',
        `${response.user.firstName} ${response.user.lastName}`
      );
      localStorage.setItem('userId', response.user.userId);
      localStorage.setItem('dateOfBirth', response.user.dateOfBirth);
      localStorage.setItem('registrationDate', response.user.registrationDate);
      if (response.user.country) {
        localStorage.setItem('country', response.user.country);
      }

      const newState: AuthState = {
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        userRole: response.user.userRole,
        userName: `${response.user.firstName} ${response.user.lastName}`,
        userEmail: response.user.email,
      };

      notifyListeners(newState);
      return response;
    } catch (error) {
      notifyListeners({ ...globalAuthState, isLoading: false });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    notifyListeners({ ...globalAuthState, isLoading: true });

    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('dateOfBirth');
      localStorage.removeItem('registrationDate');
      localStorage.removeItem('country');

      const newState: AuthState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        userRole: null,
        userName: null,
        userEmail: null,
      };

      notifyListeners(newState);
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus,
    // Legacy compatibility
    isLoggingIn: authState.isLoading,
    isLoggingOut: authState.isLoading,
  };
};
