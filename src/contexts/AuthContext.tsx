"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  Customer,
  getCurrentCustomer,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from "@/lib/medusa-api";

interface AuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount — SDK sends connect.sid cookie automatically
  useEffect(() => {
    getCurrentCustomer()
      .then((c) => setCustomer(c))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await loginCustomer(email, password);
    const c = await getCurrentCustomer();
    setCustomer(c);
  }, []);

  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      await registerCustomer(email, password, firstName, lastName);
      const c = await getCurrentCustomer();
      setCustomer(c);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await logoutCustomer();
    } catch {
      // Proceed regardless
    }
    setCustomer(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
