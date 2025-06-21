export const API_CONFIG = {
  get BASE_URL() {
    return window.__API_BASE_URL__ || 'http://localhost:5279';
  },
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add debug flag
  DEBUG: import.meta.env.DEV,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/Auth/login',
    LOGOUT: '/api/Auth/logout',
  },
  USER: {
    BASE: '/api/User',
    REGISTER_SEND_VERIFICATION: '/api/User/resister/send-verification', // Note: typo in backend "resister"
    REGISTER_VERIFY: '/api/User/register/verify-and-register',
    BY_ID: (id: string) => `/api/User/id/${id}`,
    UPDATE_PASSWORD: (id: string) => `/api/User/id/${id}/password`,
    UPDATE_PROFILE_IMAGE: (id: string) => `/api/User/${id}/profile-image`,
    RECOVERY_SEND: '/api/User/recovery/send-verification',
    RECOVERY_TEMP_PASSWORD: '/api/User/recovery/temp_password',
  },
  TEST: {
    BASE: '/api/Test',
    BY_ID: (id: string) => `/api/Test/id/${id}`,
    BY_NAME: (name: string) => `/api/Test/name/${name}`,
    BY_TYPE: '/api/Test/test_type',
  },
  TEST_TYPE: {
    BASE: '/TestType',  
    BY_ID: (id: string) => `/TestType/id/${id}`,  
    BY_NAME: (name: string) => `/TestType/name/${name}`,  
  },
  TEST_PART: {
    BASE: '/api/TestPart',
    BY_ID: (id: string) => `/api/TestPart/id/${id}`,
    BY_TEST: (testId: string) => `/api/TestPart/test/${testId}`,
  },
  SECTION: {
    BASE: '/api/Section',
    BY_ID: (id: string) => `/api/Section/id/${id}`,
    BY_PART: (partId: string) => `/api/Section/part/${partId}`,
  },
  QUESTION: {
    BASE: '/api/Question',
    BY_ID: (id: string) => `/api/Question/id/${id}`,
    BY_SECTION: (sectionId: string) => `/api/Question/section/${sectionId}`,
    MULTIPLE: '/api/Question/multiple',
    BULK: '/api/Question/bulk',
    COUNT_BY_SECTION: (sectionId: string) => `/api/Question/count/section/${sectionId}`,
  },
  ANSWER: {
    BY_ID: (id: string) => `/api/Answer/id/${id}`,
    MULTIPLE: '/api/Answer/multiple',
  },
  USER_TEST: {
    BASE: '/api/UserTest',
    BY_ID: (id: string) => `/api/UserTest/id/${id}`,
    BY_USER: (userId: string) => `/api/UserTest/user/${userId}`,
    BY_TEST: (testId: string) => `/api/UserTest/test/${testId}`,
  },
  USER_RESPONSE: {
    BASE: '/api/UserResponse',
    BY_ID: (id: string) => `/api/UserResponse/id/${id}`,
    BY_USER_TEST: (userTestId: string) => `/api/UserResponse/usertest/${userTestId}`,
    MULTIPLE: '/api/UserResponse/multiple',
  },
} as const;

// Development helpers
export const getSwaggerUrl = () => `${API_CONFIG.BASE_URL}/swagger/index.html`;
export const getApiHealthUrl = () => `${API_CONFIG.BASE_URL}/health`;

// ✅ Debug helper to verify all routes
export const verifyRoutes = () => {
  console.group('🔍 API Routes Verification');
  
  console.log('✅ Routes WITH /api/ prefix:');
  console.log('  - User:', API_ENDPOINTS.USER.BASE);
  console.log('  - Test:', API_ENDPOINTS.TEST.BASE);
  console.log('  - UserTest:', API_ENDPOINTS.USER_TEST.BASE);
  console.log('  - UserResponse:', API_ENDPOINTS.USER_RESPONSE.BASE);
  console.log('  - Question:', API_ENDPOINTS.QUESTION.BASE);
  
  console.log('❌ Routes WITHOUT /api/ prefix:');
  console.log('  - TestType:', API_ENDPOINTS.TEST_TYPE.BASE);
  
  console.log('🎯 Backend Controller Routes:');
  console.log('  - TestTypeController: [Route("[controller]")] → /TestType');
  console.log('  - UserResponseController: [Route("api/[controller]")] → /api/UserResponse');
  console.log('  - UserTestController: [Route("api/[controller]")] → /api/UserTest');
  console.log('  - TestController: [Route("api/[controller]")] → /api/Test');
  
  console.groupEnd();
};

// ✅ Route consistency checker
export const checkRouteConsistency = () => {
  const inconsistentRoutes: string[] = [];
  
  // Check TestType routes (should NOT have /api/)
  if (API_ENDPOINTS.TEST_TYPE.BASE.startsWith('/api/')) {
    inconsistentRoutes.push('TEST_TYPE.BASE should not have /api/ prefix');
  }
  
  // Check other routes (should HAVE /api/) - direct access instead of dynamic
  const routesToCheck = [
    { name: 'USER.BASE', path: API_ENDPOINTS.USER.BASE },
    { name: 'TEST.BASE', path: API_ENDPOINTS.TEST.BASE },
    { name: 'USER_TEST.BASE', path: API_ENDPOINTS.USER_TEST.BASE },
    { name: 'USER_RESPONSE.BASE', path: API_ENDPOINTS.USER_RESPONSE.BASE },
    { name: 'QUESTION.BASE', path: API_ENDPOINTS.QUESTION.BASE }
  ];
  
  routesToCheck.forEach(({ name, path }) => {
    if (!path.startsWith('/api/')) {
      inconsistentRoutes.push(`${name} should have /api/ prefix`);
    }
  });
  
  if (inconsistentRoutes.length > 0) {
    console.warn('⚠️ Route inconsistencies detected:', inconsistentRoutes);
  } else {
    console.log('✅ All routes are consistent with backend');
  }
  
  return inconsistentRoutes.length === 0;
};

// Auto-verify routes in development
if (API_CONFIG.DEBUG) {
  setTimeout(() => {
    verifyRoutes();
    checkRouteConsistency();
  }, 500);
}