import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  user: null,
  userType: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  institution: null,
};

// Actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  SET_INSTITUTION: 'SET_INSTITUTION',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        userType: action.payload.userType,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        institution: action.payload.institution || null,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    case AUTH_ACTIONS.SET_INSTITUTION:
      return {
        ...state,
        institution: action.payload,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// API base URL - use same domain as frontend when in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin)

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session-based auth
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }
      
      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  };

  // Check current user session on app load
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const data = await apiCall('/auth/me');
      
      if (data.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: data.user,
            userType: data.user_type,
            institution: data.institution,
          },
        });
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    try {
      const data = await apiCall('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (data.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: data.user,
            userType: data.user.role,
            institution: data.institution,
          },
        });
        return { 
          success: true, 
          redirectTo: data.redirect_to,
          permissions: data.permissions 
        };
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    try {
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const data = await apiCall(`/users/${state.user.id}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (data.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: data.user,
        });
        return { success: true };
      } else {
        throw new Error(data.message || 'Profile update failed');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const data = await apiCall('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData),
      });

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Password change failed');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Validate invite token
  const validateInviteToken = async (token) => {
    try {
      const data = await apiCall('/invite/validate', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Create account from invite
  const createAccountFromInvite = async (accountData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const data = await apiCall('/account/create', {
        method: 'POST',
        body: JSON.stringify(accountData),
      });

      if (data.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: data.user,
            userType: data.user_type,
            institution: data.institution,
          },
        });
        return { success: true };
      } else {
        throw new Error(data.message || 'Account creation failed');
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Helper functions for role checking
  const isAdmin = () => {
    return state.userType === 'super_admin' || state.userType === 'institution_admin';
  };

  const isSuperAdmin = () => {
    return state.userType === 'super_admin';
  };

  const isInstitutionAdmin = () => {
    return state.userType === 'institution_admin';
  };

  const isAlumni = () => {
    return state.userType === 'alumni';
  };

  const isStudent = () => {
    return state.userType === 'student';
  };

  const canAccessAdminPanel = () => {
    return isAdmin();
  };

  const value = {
    // State
    ...state,
    
    // Actions
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    validateInviteToken,
    createAccountFromInvite,
    clearError,
    checkCurrentUser,
    
    // Helpers
    isAdmin,
    isSuperAdmin,
    isInstitutionAdmin,
    isAlumni,
    isStudent,
    canAccessAdminPanel,
    
    // API helper
    apiCall,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Export actions for external use if needed
export { AUTH_ACTIONS };

export default AuthContext;
