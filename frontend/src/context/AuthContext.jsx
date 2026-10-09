import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return (await api.get("/auth/me")).user;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  const setUser = useCallback(
    (next) => {
      // Drop every other user's cached data, but keep the "me" query that this provider observes.
      qc.removeQueries({ predicate: (query) => query.queryKey[0] !== "me" });
      qc.setQueryData(["me"], next);
    },
    [qc],
  );

  const login = async (credentials) => setUser((await api.post("/auth/login", credentials)).user);
  const signup = async (credentials) => setUser((await api.post("/auth/signup", credentials)).user);
  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
  };

  // Any API call that comes back 401 signs the user out of the UI.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener("farmtrack:unauthorized", onUnauthorized);
    return () => window.removeEventListener("farmtrack:unauthorized", onUnauthorized);
  }, [setUser]);

  const value = useMemo(() => ({ user: user ?? null, isLoading, login, signup, logout }), [user, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
