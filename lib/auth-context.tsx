"use client";

import { useMutation, useQuery } from "convex/react";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  cpf: string;
  nome: string;
  telefone: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  role: "admin" | "beneficiary" | "ofertante" | "construtor";
  status: "pending" | "verified" | "active" | "rejected" | "suspended";
  termoAceitoEm?: number;
  propriedadesInteresse?: Id<"properties">[];
  dadosValidados?: boolean;
  dadosComErro?: boolean;
  mensagemErroDados?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  requestOTP: (cpf: string, telefone: string) => Promise<{ success: boolean; telefoneMascarado?: string; error?: string }>;
  verifyOTP: (cpf: string, codigo: string) => Promise<{ success: boolean; userData?: any; error?: string }>;
  acceptTerms: () => Promise<{ success: boolean; error?: string }>;
  confirmData: () => Promise<{ success: boolean; error?: string }>;
  reportDataError: (mensagem: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "aquisicao-assistida-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

const requestOTPMutation = useMutation(api.users.requestOTP);
const verifyOTPMutation = useMutation(api.users.verifyOTP);
const acceptTermsMutation = useMutation(api.users.acceptTerms);
const confirmDataMutation = useMutation(api.users.confirmData);
const reportDataErrorMutation = useMutation(api.users.reportDataError);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validate the session is still valid (you could add a session check here)
        setUser(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Persist to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const requestOTP = async (cpf: string, telefone: string) => {
    return await requestOTPMutation({ cpf, telefone });
  };

  const verifyOTP = async (cpf: string, codigo: string) => {
    const result = await verifyOTPMutation({ cpf, codigo });
    if (result.success && result.userId) {
      setUser({
        _id: result.userId,
        cpf: result.userData.cpf,
        nome: result.userData.nome,
        telefone: result.userData.telefone,
        endereco: result.userData.endereco,
        numero: result.userData.numero,
        bairro: result.userData.bairro,
        cidade: result.userData.cidade,
        estado: result.userData.estado,
        role: "beneficiary",
        status: result.userData.status,
        dadosValidados: result.userData.dadosValidados,
        dadosComErro: result.userData.dadosComErro,
        mensagemErroDados: result.userData.mensagemErroDados,
      });
    }
    return result;
  };

const acceptTerms = async () => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      await acceptTermsMutation({ userId: user._id });
      setUser({ ...user, termoAceitoEm: Date.now(), status: "active" });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  };

  const confirmData = async () => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      await confirmDataMutation({ userId: user._id });
      setUser({ ...user, dadosValidados: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  };

  const reportDataError = async (mensagem: string) => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      await reportDataErrorMutation({ userId: user._id, mensagem });
      setUser({ ...user, dadosComErro: true, mensagemErroDados: mensagem });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        requestOTP,
        verifyOTP,
        acceptTerms,
        confirmData,
        reportDataError,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
