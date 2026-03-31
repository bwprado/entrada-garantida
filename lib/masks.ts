import { maskitoChangeEventPlugin, type MaskitoOptions } from "@maskito/core"
/** Lets React controlled inputs (e.g. react-hook-form) see updates; Maskito uses `input` internally. */
const reactIntegrationPlugins = [maskitoChangeEventPlugin()] as const

export const phoneMaskOptions: MaskitoOptions = {
  mask: [
    "(",
    /\d/,
    /\d/,
    ")",
    " ",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    "-",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ],
  plugins: [...reactIntegrationPlugins],
}

/** Brazilian CPF: 000.000.000-00 (11 digits). */
export const cpfMaskOptions: MaskitoOptions = {
  mask: [
    /\d/,
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    "-",
    /\d/,
    /\d/,
  ],
  plugins: [...reactIntegrationPlugins],
}

export const cepMaskOptions: MaskitoOptions = {
  mask: [/\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/],
  plugins: [...reactIntegrationPlugins],
}
