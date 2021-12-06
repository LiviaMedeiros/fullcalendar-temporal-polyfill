
export type IntlFormatPartsMap = { [partType: string]: string }

export function hashIntlFormatParts(
  format: Intl.DateTimeFormat,
  epochMillisecond: number,
): IntlFormatPartsMap {
  const hash: IntlFormatPartsMap = {}
  const parts = format.formatToParts(epochMillisecond)

  for (const part of parts) {
    hash[part.type] = part.value
  }

  return hash
}

const eraRemap: { [eraIn: string]: string } = {
  bc: 'bce',
  ad: 'ce',
}

export function normalizeShortEra(formattedEra: string): string {
  // Example 'Before R.O.C.' -> 'before-roc'
  formattedEra = formattedEra.toLowerCase()
    .replace(/[^a-z0-9]g/, '')
    .replace(/ /g, '-')

  return eraRemap[formattedEra] || formattedEra
}
