// CPF validation using cpf-cnpj-validator
import { cpf } from 'cpf-cnpj-validator'

export function isValidCPF(cpfString: string): boolean {
  return cpf.isValid(cpfString)
}

// Phone normalization - converts formatted phone to E.164 format
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `+55${cleaned}`
  }
  return cleaned
}

// Format phone for display - converts to (99) 99999-9999
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

// Format CPF for display - converts to 999.999.999-99
export function formatCPF(cpfString: string): string {
  const cleaned = cpfString.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return cpfString
}

// CEP auto-completion via ViaCEP
export async function fetchAddressByCEP(cep: string): Promise<{
  logradouro: string
  bairro: string
  cidade: string
  estado: string
} | null> {
  const cleaned = cep.replace(/\D/g, '')
  if (cleaned.length !== 8) return null

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
    const data = await response.json()
    if (data.erro) return null

    return {
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
    }
  } catch {
    return null
  }
}
