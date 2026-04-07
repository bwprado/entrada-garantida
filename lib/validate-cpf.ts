/**
 * Validates a Brazilian CPF (Cadastro de Pessoa Física) number.
 *
 * @param cpf - The CPF string (can contain formatting characters)
 * @returns true if the CPF is valid, false otherwise
 */
export function validaCPF(cpf: string): boolean {
  const digits = String(cpf).replace(/\D/g, '')

  if (digits.length !== 11) return false

  // Reject fake CPFs (all same digits)
  if (/^(\d)\1{10}$/.test(digits)) return false

  // Validate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i)
  }

  let checkDigit = (sum * 10) % 11
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0
  if (checkDigit !== Number(digits[9])) return false

  // Validate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i)
  }

  checkDigit = (sum * 10) % 11
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0
  if (checkDigit !== Number(digits[10])) return false

  return true
}
