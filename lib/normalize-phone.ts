/**
 * Phone number normalization utilities
 *
 * Supports international phone number formatting with country code detection.
 * Currently supports BR (+55) and US (+1) formats.
 *
 * All phone numbers are stored in the database in E.164 format with + prefix.
 * Example: +5511999999999 (Brazil), +12125551234 (US)
 */

/**
 * Interface for the phone normalizer with chainable methods.
 * Provides various formats for phone numbers.
 */
interface PhoneNormalizer {
  /**
   * Formatted for display without country code
   * @returns {string} Example: "(11) 99999-9999" (BR) or "(212) 555-1234" (US)
   */
  display(): string

  /**
   * E.164 format with + prefix for SMS/Twilio
   * @returns {string} Example: "+5511999999999"
   */
  sms(): string

  /**
   * Format for WhatsApp wa.me links (no + prefix)
   * @returns {string} Example: "5511999999999"
   */
  whatsapp(): string

  /**
   * Digits only with country code
   * @returns {string} Example: "5511999999999"
   */
  digits(): string

  /**
   * Alias for sms() - database storage format
   * @returns {string} Example: "+5511999999999"
   */
  save(): string

  /**
   * Validation check
   * @returns {boolean} true if phone number is valid
   */
  isValid(): boolean
}

/**
 * Phone number normalization with chainable format methods.
 * Supports BR (+55, 10-11 digits) and US (+1, 10 digits) formats.
 *
 * Phone numbers are stored in the database in E.164 format with + prefix.
 * The country parameter helps determine the expected format.
 *
 * @function normalizePhone
 * @param {string | undefined} phone - The phone number to normalize
 * @param {string} countryCode - The country code ('BR' or 'US', defaults to 'BR')
 * @param {string} defaultAreaCode - Optional default BR area code (DDD) for local 8-9 digit numbers
 * @returns {PhoneNormalizer} An object with chainable format methods
 *
 * @example
 * // Display format (removes country code)
 * normalizePhone('+5511999999999').display()
 * // Returns: '(11) 99999-9999'
 *
 * @example
 * // SMS format (Twilio/E.164 with +)
 * normalizePhone('11999999999', 'BR').sms()
 * // Returns: '+5511999999999'
 *
 * @example
 * // WhatsApp format (digits only, no +)
 * normalizePhone('5511999999999').whatsapp()
 * // Returns: '5511999999999'
 *
 * @example
 * // Database storage format
 * normalizePhone('11999999999', 'BR').save()
 * // Returns: '+5511999999999'
 *
 * @example
 * // Validation
 * normalizePhone('invalid').isValid()
 * // Returns: false
 *
 * @example
 * // US phone number
 * normalizePhone('2125551234', 'US').display()
 * // Returns: '(212) 555-1234'
 *
 * normalizePhone('2125551234', 'US').sms()
 * // Returns: '+12125551234'
 *
 * @example
 * // BR local number without DDD
 * normalizePhone('99999-9999', 'BR', '11').sms()
 * // Returns: '+5511999999999'
 */
export const normalizePhone = (
  phone: string | undefined,
  countryCode: 'BR' | 'US' = 'BR',
  defaultAreaCode?: string
): PhoneNormalizer => {
  const getDigits = (): string => {
    if (!phone) return ''
    return phone.replace(/\D/g, '')
  }

  const getDefaultAreaCodeDigits = (): string => {
    if (!defaultAreaCode) return ''
    return defaultAreaCode.replace(/\D/g, '')
  }

  const getNormalizedDigits = (): string => {
    let digits = getDigits()
    if (!digits) return ''

    if (countryCode === 'BR') {
      // Brazilian: +55 prefix
      if (digits.startsWith('55') && digits.length >= 12) {
        return digits
      }

      // Handle 3-digit area code with leading 0 (trunk prefix)
      // Examples: 01598999728 -> 1598999728, 011999999999 -> 11999999999
      if (digits.startsWith('0') && (digits.length === 11 || digits.length === 12)) {
        digits = digits.slice(1) // Remove the leading 0
      }

      if (digits.length === 11 || digits.length === 10) {
        return `55${digits}`
      }

      // BR local number without area code (8 or 9 digits) + provided default DDD
      const areaCode = getDefaultAreaCodeDigits()
      if ((digits.length === 9 || digits.length === 8) && areaCode.length === 2) {
        return `55${areaCode}${digits}`
      }
    } else if (countryCode === 'US') {
      // US: +1 prefix
      if (digits.startsWith('1') && digits.length === 11) {
        return digits
      }
      if (digits.length === 10) {
        return `1${digits}`
      }
    }

    return digits
  }

  const isValid = (): boolean => {
    const normalized = getNormalizedDigits()
    if (!normalized) return false

    if (countryCode === 'BR') {
      // BR: 55 + 10 or 11 digits = 12-13 total
      return normalized.startsWith('55') && (normalized.length === 12 || normalized.length === 13)
    } else if (countryCode === 'US') {
      // US: 1 + 10 digits = 11 total
      return normalized.startsWith('1') && normalized.length === 11
    }

    return false
  }

  const display = (): string => {
    if (!isValid()) return ''
    const normalized = getNormalizedDigits()

    if (countryCode === 'BR') {
      // Remove country code for display: 55XXXXXXXXXXX -> XXXXXXXXXXX
      const local = normalized.slice(2)
      if (local.length === 11) {
        return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
      } else if (local.length === 10) {
        return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`
      }
    } else if (countryCode === 'US') {
      // Remove country code for display: 1XXXXXXXXXX -> XXXXXXXXXX
      const local = normalized.slice(1)
      return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
    }

    return ''
  }

  const sms = (): string => {
    if (!isValid()) return ''
    const normalized = getNormalizedDigits()
    return `+${normalized}`
  }

  const whatsapp = (): string => {
    if (!isValid()) return ''
    return getNormalizedDigits()
  }

  const digits = (): string => {
    return getNormalizedDigits()
  }

  const save = (): string => {
    return sms()
  }

  return {
    display,
    sms,
    whatsapp,
    digits,
    save,
    isValid
  }
}
