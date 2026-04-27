import { maskitoChangeEventPlugin, type MaskitoOptions } from '@maskito/core'
import {
  maskitoNumberOptionsGenerator,
  maskitoParseNumber,
  maskitoStringifyNumber,
  type MaskitoNumberParams,
} from '@maskito/kit'

import { MAX_PROPERTY_PRICE } from '@/lib/property-limits'

/** Lets React controlled inputs (e.g. react-hook-form) see updates; Maskito uses `input` internally. */
const reactIntegrationPlugins = [maskitoChangeEventPlugin()] as const

/** BRL: prefix, thousands `.`, decimals `,`, max program ceiling. */
export const brlCurrencyMaskParams: MaskitoNumberParams = {
  min: 0,
  max: MAX_PROPERTY_PRICE,
  prefix: 'R$ ',
  thousandSeparator: '.',
  decimalSeparator: ',',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}

export const brlCurrencyMaskOptions: MaskitoOptions =
  maskitoNumberOptionsGenerator(brlCurrencyMaskParams)

export function formatBrlCurrency(value: number): string {
  return maskitoStringifyNumber(value, brlCurrencyMaskParams)
}

export function parseBrlCurrency(masked: string): number | undefined {
  const n = maskitoParseNumber(masked, brlCurrencyMaskParams)
  if (Number.isNaN(n)) return undefined
  return n
}

export const phoneMaskOptions: MaskitoOptions = {
  mask: [
    '(',
    /\d/,
    /\d/,
    ')',
    ' ',
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    '-',
    /\d/,
    /\d/,
    /\d/,
    /\d/
  ],
  plugins: [...reactIntegrationPlugins]
}

/** Brazilian CPF: 000.000.000-00 (11 digits). */
export const cpfMaskOptions: MaskitoOptions = {
  mask: [
    /\d/,
    /\d/,
    /\d/,
    '.',
    /\d/,
    /\d/,
    /\d/,
    '.',
    /\d/,
    /\d/,
    /\d/,
    '-',
    /\d/,
    /\d/
  ],
  plugins: [...reactIntegrationPlugins]
}

export const cepMaskOptions: MaskitoOptions = {
  mask: [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/],
  plugins: [...reactIntegrationPlugins]
}

/** Birth date: DD/MM/AAAA (day-month-year, Brazilian order). */
export const dataNascimentoBrMaskOptions: MaskitoOptions = {
  mask: [
    /\d/,
    /\d/,
    '/',
    /\d/,
    /\d/,
    '/',
    /\d/,
    /\d/,
    /\d/,
    /\d/
  ],
  plugins: [...reactIntegrationPlugins]
}

/** RG: flexible format for Brazilian states (varies by state, up to 9 digits + letters in some states). */
export const rgMaskOptions: MaskitoOptions = {
  mask: [
    /[0-9a-zA-Z]/,
    /[0-9a-zA-Z]/,
    '.',
    /[0-9a-zA-Z]/,
    /[0-9a-zA-Z]/,
    /[0-9a-zA-Z]/,
    '.',
    /[0-9a-zA-Z]/,
    /[0-9a-zA-Z]/,
    /[0-9a-zA-Z]/,
    '-',
    /[0-9a-zA-Z]/
  ],
  plugins: [...reactIntegrationPlugins]
}
