import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import { 
  getToken, 
  setToken, 
  removeToken, 
  getUser, 
  setUser, 
  isAuthenticated 
} from '../utils/auth';

// Auth context
const AuthContext = createContext();

// Auth actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
  user: getUser(),
  isAuthenticated: isAuthenticated(),
  isLoading: false,
  error: null,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
      };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      const user = getUser();
      
      if (token && user) {
        try {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
          
          // Verify token is still valid by fetching profile
          const response = await authAPI.getProfile();
          const updatedUser = response.data.data.user;
          
          // Update user data in case it changed
          setUser(updatedUser);
          dispatch({ 
            type: AUTH_ACTIONS.SET_USER, 
            payload: { user: updatedUser } 
          });
        } catch (error) {
          console.error('Token verification failed:', error);
          // Token is invalid, clear auth data
          removeToken();
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.login(credentials);
      const { user, token } = response.data.data;

      // Store auth data
      setToken(token);
      setUser(user);

      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: { user } });
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.signup(userData);
      const { user, token } = response.data.data;

      // Store auth data
      setToken(token);
      setUser(user);

      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: { user } });
      
      return { success: true, user };
    } catch (error) {
      let errorMessage = 'Signup failed';
      
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map(e => e.message).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      // Call logout endpoint (optional since JWT is stateless)
      try {
        await authAPI.logout();
      } catch (error) {
        // Ignore logout API errors
        console.warn('Logout API call failed:', error);
      }
      
      // Clear local auth data
      removeToken();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      removeToken();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return { success: true };
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.data.user;

      // Update stored user data
      setUser(updatedUser);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: { user: updatedUser } });
      
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Helper functions
  const isManager = () => state.user?.role === 'manager';
  const isTeamLead = () => state.user?.role === 'teamLead';
  const hasRole = (role) => state.user?.role === role;

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    login,
    signup,
    logout,
    updateProfile,
    clearError,
    
    // Helpers
    isManager,
    isTeamLead,
    hasRole,
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

export default AuthContext;
