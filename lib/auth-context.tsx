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
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  role: "admin" | "beneficiary" | "ofertante" | "construtor";
  status: "pending" | "verified" | "active" | "rejected" | "suspended" | "onboarding";
  termoAceitoEm?: number;
  propriedadesInteresse?: Id<"properties">[];
  dadosValidados?: boolean;
  dadosComErro?: boolean;
  mensagemErroDados?: string;
  // Ofertante fields
  dataNascimento?: string;
  onboardingCompleto?: boolean;
  documentosPendentes?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Beneficiary login methods
  requestOTP: (cpf: string, telefone: string) => Promise<{ success: boolean; telefoneMascarado?: string; error?: string }>;
  verifyOTP: (cpf: string, codigo: string) => Promise<{ success: boolean; userData?: any; error?: string }>;
  acceptTerms: () => Promise<{ success: boolean; error?: string }>;
  confirmData: () => Promise<{ success: boolean; error?: string }>;
  reportDataError: (mensagem: string) => Promise<{ success: boolean; error?: string }>;
  // Phone-based login methods (Ofertante & Admin)
  requestOTPByPhone: (telefone: string, tipo: "ofertante" | "admin") => Promise<{ success: boolean; telefoneMascarado?: string; isNewUser?: boolean; error?: string }>;
  registerOfertante: (telefone: string, nome: string) => Promise<{ success: boolean; userId?: string; error?: string }>;
  verifyOTPByPhone: (telefone: string, codigo: string) => Promise<{ success: boolean; userData?: any; needsOnboarding?: boolean; error?: string }>;
  completeOnboarding: (data: OnboardingData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface OnboardingData {
  userId: Id<"users">;
  nome?: string;
  cpf: string;
  dataNascimento: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "aquisicao-assistida-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mutations for beneficiary login
  const requestOTPMutation = useMutation(api.users.requestOTP);
  const verifyOTPMutation = useMutation(api.users.verifyOTP);
  const acceptTermsMutation = useMutation(api.users.acceptTerms);
  const confirmDataMutation = useMutation(api.users.confirmData);
  const reportDataErrorMutation = useMutation(api.users.reportDataError);

  // Mutations for phone-based login (ofertante & admin)
  const requestOTPByPhoneMutation = useMutation(api.users.requestOTPByPhone);
  const registerOfertanteMutation = useMutation(api.users.registerOfertante);
  const verifyOTPByPhoneMutation = useMutation(api.users.verifyOTPByPhone);
  const completeOnboardingMutation = useMutation(api.users.completeOfertanteOnboarding);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
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

  // Beneficiary login methods
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

  // Phone-based login methods (Ofertante & Admin)
  const requestOTPByPhone = async (telefone: string, tipo: "ofertante" | "admin") => {
    return await requestOTPByPhoneMutation({ telefone, tipo });
  };

  const registerOfertante = async (telefone: string, nome: string) => {
    const result = await registerOfertanteMutation({ telefone, nome });
    if (result.success && result.userId) {
      setUser({
        _id: result.userId,
        cpf: "",
        nome: nome,
        telefone: telefone.replace(/\D/g, ""),
        role: "ofertante",
        status: "onboarding",
        onboardingCompleto: false,
      });
    }
    return result;
  };

  const verifyOTPByPhone = async (telefone: string, codigo: string) => {
    const result = await verifyOTPByPhoneMutation({ telefone, codigo });
    if (result.success && result.userId) {
      setUser({
        _id: result.userId,
        cpf: result.userData.cpf || "",
        nome: result.userData.nome,
        telefone: result.userData.telefone,
        endereco: result.userData.endereco,
        numero: result.userData.numero,
        complemento: result.userData.complemento,
        bairro: result.userData.bairro,
        cidade: result.userData.cidade,
        estado: result.userData.estado,
        role: result.userData.role,
        status: result.userData.status,
        dataNascimento: result.userData.dataNascimento,
        onboardingCompleto: result.userData.onboardingCompleto,
      });
    }
    return result;
  };

  const completeOnboarding = async (data: OnboardingData) => {
    const result = await completeOnboardingMutation(data);
    if (result.success && user) {
      setUser({
        ...user,
        cpf: data.cpf,
        nome: data.nome || user.nome,
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        dataNascimento: data.dataNascimento,
        onboardingCompleto: true,
        status: "active",
      });
    }
    return result;
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
        requestOTPByPhone,
        registerOfertante,
        verifyOTPByPhone,
        completeOnboarding,
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
