/**
 * AuthContext — Global authentication state
 * Manages user session, token storage, and auth operations
 */
import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { authApi } from '@api/authApi';
import { storage } from '@utils/storage';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// ── State & Reducer ────────────────────────────────────────────────────────
const initialState = {
  user: null,
  accessToken: storage.get('accessToken'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AUTH_ACTIONS = {
  SET_LOADING:   'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT:        'LOGOUT',
  UPDATE_USER:   'UPDATE_USER',
  SET_ERROR:     'SET_ERROR',
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, accessToken: null, isLoading: false };
    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

// ── Provider ───────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Hydrate session on mount
  useEffect(() => {
    const hydrate = async () => {
      const token = storage.get('accessToken');
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }
      try {
        const { data: body } = await authApi.getMe();
        const user = body?.data?.user;
        if (!user) throw new Error('Invalid session');
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, accessToken: token },
        });
      } catch {
        storage.remove('accessToken');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };
    hydrate();
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const { data } = await authApi.login(credentials);
      const { user, accessToken } = data.data;
      storage.set('accessToken', accessToken);
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, accessToken } });
      toast.success(`Welcome back, ${user.name}! 👋`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const { data } = await authApi.register(userData);
      const { user, accessToken } = data.data;
      storage.set('accessToken', accessToken);
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, accessToken } });
      toast.success(`Welcome to PrepWise, ${user.name}! 🎉`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch { /* silent */ }
    storage.remove('accessToken');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updates) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updates });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
