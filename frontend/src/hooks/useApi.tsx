import api from '@/api/indexApi';
import type { ApiError, LoadingState, UserAnswer } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseAPIOptions<T> {
  initialData?: T;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseAPIReturn<T> extends LoadingState {
  data: T | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

/**
 * Generic hook for API calls
 */
export function useAPI<T = any>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseAPIOptions<T> = {}
): UseAPIReturn<T> {
  const { initialData = null, immediate = false, onSuccess, onError } = options;

  const [state, setState] = useState<LoadingState & { data: T | null }>({
    data: initialData,
    isLoading: false,
    error: null,
    lastUpdated: undefined,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await apiCall(...args);
        setState({
          data: result,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error: any) {
        console.error('API call failed:', error);

        // Safe error handling
        const apiError: ApiError = {
          code:
            error?.code && typeof error.code === 'string'
              ? error.code
              : 'UNKNOWN_ERROR',
          message:
            error?.message && typeof error.message === 'string'
              ? error.message
              : 'An unexpected error occurred',
          details: error?.details || null,
        };

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: apiError.message,
          lastUpdated: new Date(),
        }));

        if (onError) {
          try {
            onError(apiError);
          } catch (callbackError) {
            console.error('Error in onError callback:', callbackError);
          }
        }

        throw apiError;
      }
    },
    [apiCall, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
      lastUpdated: undefined,
    });
  }, [initialData]);

  useEffect(() => {
    if (immediate) {
      execute().catch(console.error);
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedAPI<T = any>(
  apiCall: (page: number, limit: number, ...args: any[]) => Promise<T[]>,
  options: UseAPIOptions<T[]> & {
    initialPage?: number;
    pageSize?: number;
  } = {}
) {
  const { initialPage = 1, pageSize = 10, ...apiOptions } = options;
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [allData, setAllData] = useState<T[]>([]);

  const {
    data,
    isLoading,
    error,
    execute: executeAPI,
    reset: resetAPI,
  } = useAPI(
    (currentPage: number, ...args: any[]) =>
      apiCall(currentPage, pageSize, ...args),
    apiOptions
  );

  const loadMore = useCallback(
    async (...args: any[]) => {
      try {
        const newData = await executeAPI(page, ...args);

        if (Array.isArray(newData)) {
          setAllData((prev) => [...prev, ...newData]);
          setHasMore(newData.length === pageSize);
          setPage((prev) => prev + 1);
        }

        return newData;
      } catch (error) {
        console.error('Load more failed:', error);
        throw error;
      }
    },
    [executeAPI, page, pageSize]
  );

  const reset = useCallback(() => {
    setPage(initialPage);
    setHasMore(true);
    setAllData([]);
    resetAPI();
  }, [initialPage, resetAPI]);

  const refresh = useCallback(
    async (...args: any[]) => {
      reset();
      return loadMore(...args);
    },
    [reset, loadMore]
  );

  return {
    data: allData,
    currentPageData: data,
    isLoading,
    error,
    hasMore,
    page,
    loadMore,
    refresh,
    reset,
  };
}

/**
 * Hook for form submissions
 */
export function useSubmit<TData = any, TResult = any>(
  submitFn: (data: TData) => Promise<TResult>,
  options: {
    onSuccess?: (result: TResult) => void;
    onError?: (error: ApiError) => void;
    resetOnSuccess?: boolean;
  } = {}
) {
  const { onSuccess, onError, resetOnSuccess = false } = options;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = useCallback(
    async (data: TData): Promise<TResult | null> => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const result = await submitFn(data);

        if (onSuccess) {
          try {
            onSuccess(result);
          } catch (callbackError) {
            console.error('Error in onSuccess callback:', callbackError);
          }
        }

        if (resetOnSuccess) {
          setSubmitError(null);
        }

        return result;
      } catch (error: any) {
        console.error('Submit failed:', error);

        const apiError: ApiError = {
          code:
            error?.code && typeof error.code === 'string'
              ? error.code
              : 'SUBMIT_ERROR',
          message:
            error?.message && typeof error.message === 'string'
              ? error.message
              : 'Failed to submit',
          details: error?.details || null,
        };

        const errorMessage = apiError.message || 'An error occurred';
        setSubmitError(errorMessage);

        if (onError) {
          try {
            onError(apiError);
          } catch (callbackError) {
            console.error('Error in onError callback:', callbackError);
          }
        }

        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitFn, onSuccess, onError, resetOnSuccess]
  );

  const clearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  return {
    submit,
    isSubmitting,
    submitError,
    clearError,
  };
}

// Specific API hooks for common operations
export const useAuth = () => {
  const { auth } = api;

  const login = useSubmit(auth.login.bind(auth), {
    onSuccess: (response) => {
      try {
        localStorage.setItem('authToken', 'mock-jwt-token');
        localStorage.setItem('userRole', response.user.userRole);
        localStorage.setItem('userEmail', response.user.email);
      } catch (storageError) {
        console.error('Error saving auth data to localStorage:', storageError);
      }
    },
  });

  const logout = useSubmit(auth.logout.bind(auth), {
    onSuccess: () => {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        window.location.href = '/auth/login';
      } catch (error) {
        console.error('Error during logout:', error);
        // Force redirect anyway
        window.location.href = '/auth/login';
      }
    },
  });

  const register = useSubmit(auth.verifyAndRegister.bind(auth));

  return {
    login: login.submit,
    logout: logout.submit,
    register: register.submit,
    isLoggingIn: login.isSubmitting,
    isLoggingOut: logout.isSubmitting,
    isRegistering: register.isSubmitting,
    loginError: login.submitError,
    logoutError: logout.submitError,
    registerError: register.submitError,
  };
};

export const useTests = () => {
  const { test } = api;

  const {
    data: tests,
    isLoading,
    error,
    execute: fetchTests,
  } = useAPI(test.getTests.bind(test));

  const getTestById = useAPI(test.getTestById.bind(test));

  return {
    tests,
    isLoading,
    error,
    fetchTests,
    getTestById: getTestById.execute,
    isLoadingTest: getTestById.isLoading,
    testError: getTestById.error,
  };
};

export const useTestSession = () => {
  const { testSession } = api;

  const initializeSession = useSubmit(
    ({ userId, testId }: { userId: string; testId: string }) =>
      testSession.initializeSession(userId, testId)
  );
  const submitTest = useSubmit(
    ({ sessionId, answers }: { sessionId: string; answers: UserAnswer[] }) =>
      testSession.submitTest(sessionId, answers)
  );
  const saveAnswer = useSubmit(
    ({ sessionId, answer }: { sessionId: string; answer: UserAnswer }) =>
      testSession.saveAnswer(sessionId, answer)
  );

  return {
    initializeSession: initializeSession.submit,
    submitTest: submitTest.submit,
    saveAnswer: saveAnswer.submit,
    isInitializing: initializeSession.isSubmitting,
    isSubmitting: submitTest.isSubmitting,
    isSaving: saveAnswer.isSubmitting,
    initError: initializeSession.submitError,
    submitError: submitTest.submitError,
    saveError: saveAnswer.submitError,
  };
};
