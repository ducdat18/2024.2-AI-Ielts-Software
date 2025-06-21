// utils/auth.ts
export const authUtils = {
    // Check if user is authenticated
    isAuthenticated: (): boolean => {
      return localStorage.getItem('authToken') !== null;
    },
  
    // Get user role
    getUserRole: (): string => {
      return localStorage.getItem('userRole') || 'learner';
    },
  
    // Get user email
    getUserEmail: (): string => {
      return localStorage.getItem('userEmail') || '';
    },
  
    // Get user name
    getUserName: (): string => {
      return localStorage.getItem('userName') || '';
    },
  
    // Get user target score
    getTargetScore: (): string => {
      return localStorage.getItem('targetScore') || '7.0';
    },
  
    // Get user current level
    getCurrentLevel: (): string => {
      return localStorage.getItem('currentLevel') || 'intermediate';
    },
  
    // Login user
    login: (email: string, role: string, token: string, additionalData?: any) => {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);
      
      if (additionalData?.name) {
        localStorage.setItem('userName', additionalData.name);
      }
      if (additionalData?.targetScore) {
        localStorage.setItem('targetScore', additionalData.targetScore);
      }
      if (additionalData?.currentLevel) {
        localStorage.setItem('currentLevel', additionalData.currentLevel);
      }
    },
  
    // Logout user
    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('targetScore');
      localStorage.removeItem('currentLevel');
    },
  
    // Get redirect path based on role
    getRedirectPath: (role: string): string => {
      switch (role) {
        case 'admin':
          return '/admin/dashboard';
        case 'learner':
        default:
          return '/learner/dashboard';
      }
    }
  };
  
  // Demo user data for development
  export const demoUsers = {
    admin: {
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      name: 'Admin User'
    },
    learner: {
      email: 'user@test.com',
      password: 'user123',
      role: 'learner',
      name: 'John Doe',
      targetScore: '7.5',
      currentLevel: 'intermediate'
    }
  };
  
  // Mock API functions for development
  export const mockAuthAPI = {
    login: async (email: string, password: string) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === demoUsers.admin.email && password === demoUsers.admin.password) {
        return {
          success: true,
          user: demoUsers.admin,
          token: 'mock-admin-token'
        };
      }
      
      if (email === demoUsers.learner.email && password === demoUsers.learner.password) {
        return {
          success: true,
          user: demoUsers.learner,
          token: 'mock-learner-token'
        };
      }
      
      // Check for any @test.com email with user123 password
      if (email.endsWith('@test.com') && password === 'user123') {
        return {
          success: true,
          user: {
            email,
            role: 'learner',
            name: email.split('@')[0].replace('.', ' '),
            targetScore: '7.0',
            currentLevel: 'intermediate'
          },
          token: 'mock-learner-token'
        };
      }
      
      throw new Error('Invalid email or password. Try admin@test.com/admin123 or user@test.com/user123');
    },
    
    register: async (userData: any) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful registration
      return {
        success: true,
        user: {
          ...userData,
          role: 'learner'
        },
        token: 'mock-learner-token'
      };
    }
  };