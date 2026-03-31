import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchUserProfile, loginUser, registerUser } from "../api.js";

const USER_TOKEN_KEY = "nano_online_user_token";

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(USER_TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile(token);
        setUser(profile);
      } catch (error) {
        setUser(null);
      }
    };

    loadProfile();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setStatus("");
    try {
      const data = await loginUser({ email, password });
      const accessToken = data.access_token || data.token || data.accessToken;
      if (!accessToken) {
        throw new Error("Login succeeded but no token was returned");
      }
      localStorage.setItem(USER_TOKEN_KEY, accessToken);
      setToken(accessToken);
      setStatus("Login successful");
      return true;
    } catch (error) {
      setStatus(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setStatus("");
    try {
      await registerUser(payload);
      setStatus("Registration complete. Please sign in.");
      return true;
    } catch (error) {
      setStatus(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setStatus("Logged out");
  };

  const value = useMemo(
    () => ({
      token,
      user,
      status,
      loading,
      login,
      register,
      logout,
      setStatus,
      isAuthenticated: Boolean(token)
    }),
    [token, user, status, loading]
  );

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within UserAuthProvider");
  }
  return context;
}
