"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface SessionUser {
  id_usuario: number;
  nombre_usuario: string;
  roles: string[];
  id_cliente: number | null;
  token: string;
}

interface AuthCtx {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const KEY  = "cs_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, contrasena: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, contrasena }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Error al iniciar sesión");
    const sess: SessionUser = {
      id_usuario:    data.id_usuario,
      nombre_usuario:data.nombre_usuario,
      roles:         data.roles,
      id_cliente:    data.id_cliente ?? null,
      token:         data.token,
    };
    localStorage.setItem(KEY, JSON.stringify(sess));
    setUser(sess);
  }, []);

  const logout = useCallback(async () => {
    const raw  = localStorage.getItem(KEY);
    const token = raw ? JSON.parse(raw).token : null;
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: token ? { "X-Session-Token": token } : {},
    }).catch(() => {});
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isAdmin: user?.roles.includes("Administrador") ?? false,
      isStaff: user?.roles.some(r => ["Administrador","Empleado"].includes(r)) ?? false,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Hook para llamadas autenticadas
export function useApi() {
  const { user } = useAuth();
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return useCallback(async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    const headers: Record<string,string> = {
      ...(!(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(user?.token ? { "X-Session-Token": user.token } : {}),
      ...(init.headers as Record<string,string> || {}),
    };
    const res = await fetch(`${API}${path}`, { ...init, headers, credentials: "include" });
    if (res.status === 204) return null as T;
    const data = await res.json().catch(() => ({ detail: "Error de red" }));
    if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
    return data;
  }, [user?.token, API]);
}
