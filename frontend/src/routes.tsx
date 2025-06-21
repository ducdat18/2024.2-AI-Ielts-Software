import React, { Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

// Layouts
import LearnerLayout from './layouts/LearnerLayout';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';

// Updated Auth components
import {
  ProtectedRoute,
  AuthRedirect,
  LoadingSpinner,
} from './components/auth';

// Loading component using optimized LoadingSpinner
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="flex flex-col items-center space-y-4">
      <LoadingSpinner size="lg" />
      <div className="text-white text-lg">Loading...</div>
    </div>
  </div>
);

// Lazy load components (keeping existing imports)
// Auth Pages
const Login = React.lazy(() => import('./pages/auth/LoginPage'));
const Register = React.lazy(() => import('./pages/auth/RegisterPage'));

// Common Pages
const Home = React.lazy(() => import('./pages/common/HomePage'));
const About = React.lazy(() => import('./pages/common/AboutPage'));
const NotFound = React.lazy(() => import('./pages/common/NotFoundPage'));

// Test Pages (shared)
const TestList = React.lazy(() => import('./pages/test/TestListPage'));
const TestTaking = React.lazy(() => import('./pages/test/TestTakingPage'));
const TestResult = React.lazy(() => import('./pages/test/TestResultPage'));

// ✨ NEW: Writing Evaluation Page
const WritingEvaluationResult = React.lazy(
  () => import('./pages/test/WritingEvaluationResultPage')
);

// Learner Pages
const LearnerDashboard = React.lazy(
  () => import('./pages/learner/LearnerDashboardPage')
);
const Progress = React.lazy(() => import('./pages/learner/ProgressPage'));
const LearnerProfile = React.lazy(() => import('./pages/learner/ProfilePage'));

// Admin Pages
const AdminDashboard = React.lazy(
  () => import('./pages/admin/AdminDashboardPage')
);
const TestManagement = React.lazy(
  () => import('./pages/admin/TestManagementPage')
);
const UserManagement = React.lazy(
  () => import('./pages/admin/UserManagementPage')
);

// Router configuration
const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },

  // Public routes
  {
    path: '/home',
    element: (
      <PublicLayout>
        <Suspense fallback={<Loading />}>
          <Home />
        </Suspense>
      </PublicLayout>
    ),
  },
  {
    path: '/about',
    element: (
      <PublicLayout>
        <Suspense fallback={<Loading />}>
          <About />
        </Suspense>
      </PublicLayout>
    ),
  },
  {
    path: '/tests',
    element: (
      <PublicLayout>
        <Suspense fallback={<Loading />}>
          <TestList />
        </Suspense>
      </PublicLayout>
    ),
  },

  // Auth routes - redirect if already authenticated
  {
    path: '/auth',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/auth/login',
    element: (
      <AuthRedirect>
        <Suspense fallback={<Loading />}>
          <Login />
        </Suspense>
      </AuthRedirect>
    ),
  },
  {
    path: '/auth/register',
    element: (
      <AuthRedirect>
        <Suspense fallback={<Loading />}>
          <Register />
        </Suspense>
      </AuthRedirect>
    ),
  },

  {
    path: '/test/:testId',
    element: (
      <ProtectedRoute requireAuth={true}>
        <Suspense fallback={<Loading />}>
          <TestTaking />
        </Suspense>
      </ProtectedRoute>
    ),
  },

  // Learner routes - using "user" role as per backend API
  {
    path: '/learner',
    element: (
      <ProtectedRoute requiredRole="user">
        <LearnerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/learner/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<Loading />}>
            <LearnerDashboard />
          </Suspense>
        ),
      },
      {
        path: 'tests',
        element: (
          <Suspense fallback={<Loading />}>
            <TestList />
          </Suspense>
        ),
      },
      {
        path: 'test/:testId/result/:resultId',
        element: (
          <Suspense fallback={<Loading />}>
            <TestResult />
          </Suspense>
        ),
      },
      {
        path: 'test/:testId/writing-result/:resultId',
        element: (
          <Suspense fallback={<Loading />}>
            <WritingEvaluationResult />
          </Suspense>
        ),
      },
      {
        path: 'progress',
        element: (
          <Suspense fallback={<Loading />}>
            <Progress />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<Loading />}>
            <LearnerProfile />
          </Suspense>
        ),
      },
    ],
  },

  // Admin routes - using "admin" role as per backend API
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<Loading />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: 'tests',
        element: (
          <Suspense fallback={<Loading />}>
            <TestManagement />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<Loading />}>
            <UserManagement />
          </Suspense>
        ),
      },
    ],
  },

  // 404 Not Found
  {
    path: '*',
    element: (
      <PublicLayout>
        <Suspense fallback={<Loading />}>
          <NotFound />
        </Suspense>
      </PublicLayout>
    ),
  },
]);

// Main Routes component
const Routes: React.FC = () => {
  return <RouterProvider router={router} />;
};

export interface Breadcrumb {
  title: string;
  path: string;
  isLast?: boolean;
}

export default Routes;

// Export route constants (updated to include writing evaluation)
export const ROUTES = {
  HOME: '/home',
  ABOUT: '/about',
  TESTS: '/tests',
  TEST_TAKING: (testId: string) => `/test/${testId}`,

  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },

  LEARNER: {
    ROOT: '/learner',
    DASHBOARD: '/learner/dashboard',
    TESTS: '/learner/tests',
    TEST_RESULT: (testId: string, resultId: string) =>
      `/learner/test/${testId}/result/${resultId}`,
    // ✨ NEW: Writing Evaluation Result Route
    WRITING_RESULT: (testId: string, resultId: string) =>
      `/learner/test/${testId}/writing-result/${resultId}`,
    PROGRESS: '/learner/progress',
    PROFILE: '/learner/profile',
  },

  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    TESTS: '/admin/tests',
    USERS: '/admin/users',
  },
} as const;

// Navigation helper functions (updated with writing evaluation)
export const navigateToTest = (testId: string) => ROUTES.TEST_TAKING(testId);

export const navigateToResult = (testId: string, resultId: string) =>
  ROUTES.LEARNER.TEST_RESULT(testId, resultId);

// ✨ NEW: Navigate to writing evaluation result
export const navigateToWritingResult = (testId: string, resultId: string) =>
  ROUTES.LEARNER.WRITING_RESULT(testId, resultId);

// ✨ NEW: Smart result navigation based on test type
export const navigateToTestResult = (
  testId: string,
  resultId: string,
  testType?: 'writing' | 'reading' | 'listening' | 'speaking'
) => {
  if (testType === 'writing') {
    return ROUTES.LEARNER.WRITING_RESULT(testId, resultId);
  }
  return ROUTES.LEARNER.TEST_RESULT(testId, resultId);
};

// Role-based redirect helper (updated to match backend API)
export const getDefaultRouteForRole = (userRole: 'user' | 'admin') => {
  switch (userRole) {
    case 'admin':
      return ROUTES.ADMIN.DASHBOARD;
    case 'user':
      return ROUTES.LEARNER.DASHBOARD;
    default:
      return ROUTES.HOME;
  }
};

// Auth status helper for components
export const getAuthRedirectPath = (userRole: 'user' | 'admin' | null) => {
  if (!userRole) return ROUTES.AUTH.LOGIN;
  return getDefaultRouteForRole(userRole);
};

// Route access checker helper (updated with writing evaluation)
export const checkRouteAccess = (
  currentPath: string,
  userRole: 'user' | 'admin' | null,
  isAuthenticated: boolean
) => {
  // Public routes - accessible to everyone
  const publicRoutes = [ROUTES.HOME, ROUTES.ABOUT, ROUTES.TESTS];
  if (publicRoutes.some((route) => currentPath.startsWith(route))) {
    return { hasAccess: true, redirectTo: null };
  }

  // Auth routes - only for non-authenticated users
  if (currentPath.startsWith('/auth/')) {
    if (isAuthenticated && userRole) {
      return {
        hasAccess: false,
        redirectTo: getDefaultRouteForRole(userRole),
      };
    }
    return { hasAccess: true, redirectTo: null };
  }

  // Protected routes - require authentication
  if (!isAuthenticated) {
    return {
      hasAccess: false,
      redirectTo: ROUTES.AUTH.LOGIN,
    };
  }

  // Role-specific routes
  if (currentPath.startsWith('/admin/') && userRole !== 'admin') {
    return {
      hasAccess: false,
      redirectTo: ROUTES.LEARNER.DASHBOARD,
    };
  }

  if (currentPath.startsWith('/learner/') && userRole !== 'user') {
    return {
      hasAccess: false,
      redirectTo: ROUTES.ADMIN.DASHBOARD,
    };
  }

  return { hasAccess: true, redirectTo: null };
};

// ✨ NEW: Test type detection helper
export const getTestTypeFromPath = (
  path: string
): 'writing' | 'regular' | null => {
  if (path.includes('/writing-result/')) return 'writing';
  if (path.includes('/result/')) return 'regular';
  return null;
};

// ✨ NEW: Route pattern matcher for test results
export const isTestResultRoute = (path: string): boolean => {
  const patterns = [
    /^\/learner\/test\/[^/]+\/result\/[^/]+$/,
    /^\/learner\/test\/[^/]+\/writing-result\/[^/]+$/,
  ];
  return patterns.some((pattern) => pattern.test(path));
};

// Route metadata for navigation and breadcrumbs (updated with writing evaluation)
export const ROUTE_METADATA = {
  [ROUTES.HOME]: {
    title: 'Home',
    description: 'IELTS Online Test Platform',
    requiresAuth: false,
  },
  [ROUTES.ABOUT]: {
    title: 'About',
    description: 'About IELTS Online',
    requiresAuth: false,
  },
  [ROUTES.TESTS]: {
    title: 'Tests',
    description: 'Available IELTS Tests',
    requiresAuth: false,
  },
  [ROUTES.AUTH.LOGIN]: {
    title: 'Login',
    description: 'Sign in to your account',
    requiresAuth: false,
  },
  [ROUTES.AUTH.REGISTER]: {
    title: 'Register',
    description: 'Create a new account',
    requiresAuth: false,
  },
  [ROUTES.LEARNER.DASHBOARD]: {
    title: 'Dashboard',
    description: 'Your learning progress',
    requiresAuth: true,
    role: 'user',
  },
  [ROUTES.LEARNER.TESTS]: {
    title: 'My Tests',
    description: 'Your test history and available tests',
    requiresAuth: true,
    role: 'user',
  },
  // Regular test result
  '/learner/test/:testId/result/:resultId': {
    title: 'Test Results',
    description: 'Your test performance and feedback',
    requiresAuth: true,
    role: 'user',
  },
  // ✨ NEW: Writing evaluation result metadata
  '/learner/test/:testId/writing-result/:resultId': {
    title: 'Writing Test Results',
    description: 'AI-powered writing evaluation and feedback',
    requiresAuth: true,
    role: 'user',
    testType: 'writing',
  },
  [ROUTES.LEARNER.PROGRESS]: {
    title: 'Progress',
    description: 'Track your learning progress',
    requiresAuth: true,
    role: 'user',
  },
  [ROUTES.LEARNER.PROFILE]: {
    title: 'Profile',
    description: 'Manage your profile settings',
    requiresAuth: true,
    role: 'user',
  },
  [ROUTES.ADMIN.DASHBOARD]: {
    title: 'Admin Dashboard',
    description: 'System overview and analytics',
    requiresAuth: true,
    role: 'admin',
  },
  [ROUTES.ADMIN.TESTS]: {
    title: 'Test Management',
    description: 'Manage IELTS tests and questions',
    requiresAuth: true,
    role: 'admin',
  },
  [ROUTES.ADMIN.USERS]: {
    title: 'User Management',
    description: 'Manage system users',
    requiresAuth: true,
    role: 'admin',
  },
} as const;

// ✨ NEW: Dynamic route metadata getter for parameterized routes
export const getRouteMetadata = (path: string) => {
  // Check for exact matches first
  if (ROUTE_METADATA[path as keyof typeof ROUTE_METADATA]) {
    return ROUTE_METADATA[path as keyof typeof ROUTE_METADATA];
  }

  // Check for pattern matches
  if (path.match(/^\/learner\/test\/[^/]+\/writing-result\/[^/]+$/)) {
    return ROUTE_METADATA['/learner/test/:testId/writing-result/:resultId'];
  }

  if (path.match(/^\/learner\/test\/[^/]+\/result\/[^/]+$/)) {
    return ROUTE_METADATA['/learner/test/:testId/result/:resultId'];
  }

  return null;
};

// ✨ NEW: Breadcrumb generator
export const generateBreadcrumbs = (path: string): Breadcrumb[] => {
  // explicitly type as string paths
  const breadcrumbs: Breadcrumb[] = [{ title: 'Home', path: ROUTES.HOME }];

  let currentPath = '';
  const segments = path.split('/').filter(Boolean);

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // skip ID segments
    if (segment.length === 24 && /^[0-9a-f]+$/i.test(segment)) {
      return;
    }

    const metadata = getRouteMetadata(currentPath);
    if (metadata) {
      breadcrumbs.push({
        title: metadata.title,
        path: currentPath, // now OK: path is string
        isLast: index === segments.length - 1,
      });
    }
  });

  return breadcrumbs;
};

// ✨ NEW: Test result URL helpers
export const TestResultUrls = {
  // Get the appropriate result URL based on test type
  getResultUrl: (testId: string, resultId: string, testType?: string) => {
    if (testType?.toLowerCase() === 'writing') {
      return ROUTES.LEARNER.WRITING_RESULT(testId, resultId);
    }
    return ROUTES.LEARNER.TEST_RESULT(testId, resultId);
  },

  // Parse test ID and result ID from current path
  parseResultPath: (path: string) => {
    const writingMatch = path.match(
      /^\/learner\/test\/([^/]+)\/writing-result\/([^/]+)$/
    );
    if (writingMatch) {
      return {
        testId: writingMatch[1],
        resultId: writingMatch[2],
        type: 'writing' as const,
      };
    }

    const regularMatch = path.match(
      /^\/learner\/test\/([^/]+)\/result\/([^/]+)$/
    );
    if (regularMatch) {
      return {
        testId: regularMatch[1],
        resultId: regularMatch[2],
        type: 'regular' as const,
      };
    }

    return null;
  },

  // Check if current path is a result page
  isResultPage: (path: string) => {
    return isTestResultRoute(path);
  },

  // Get test type from result path
  getTestTypeFromResultPath: (path: string) => {
    const parsed = TestResultUrls.parseResultPath(path);
    return parsed?.type || null;
  },
};
