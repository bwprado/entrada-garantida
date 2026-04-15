// CPF validation using cpf-cnpj-validator
import { cpf } from 'cpf-cnpj-validator'

export function isValidCPF(cpfString: string): boolean {
  return cpf.isValid(cpfString)
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
      estado: data.uf
    }
  } catch {
    return null
  }
}
