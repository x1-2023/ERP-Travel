// Export Control Classification check
// Determines risk level based on product ECCN/ITAR status and destination country

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

// ECCN categories that require export license
const CONTROLLED_ECCN = [
  '9A012', // Military aircraft
  '9A004', // Space launch vehicles
  '3A001', // Electronics
  '5A002', // Encryption
  '6A003', // Cameras/sensors
  '7A003', // Navigation
  '1C351', // Chemical agents
]

// Countries requiring special attention for export control
const EXPORT_RESTRICTED = ['IR', 'KP', 'SY', 'CU']
const EXPORT_LICENSED = ['CN', 'RU', 'BY', 'MM', 'VE']

export function checkExportControl(
  product: { eccn?: string | null; itar: boolean },
  destinationCountry: string
): { riskLevel: RiskLevel; message: string; requiresLicense: boolean } {
  const country = destinationCountry.toUpperCase()

  // ITAR = US origin military items, cannot export without State Dept license
  if (product.itar && country !== 'US') {
    if (EXPORT_RESTRICTED.includes(country)) {
      return {
        riskLevel: 'CRITICAL',
        message: `ITAR-controlled item cannot be exported to ${country} (restricted country)`,
        requiresLicense: true,
      }
    }
    return {
      riskLevel: 'CRITICAL',
      message: `ITAR-controlled item requires State Department license for export to ${country}`,
      requiresLicense: true,
    }
  }

  // ECCN controlled items
  if (product.eccn) {
    const isControlled = CONTROLLED_ECCN.some((eccn) =>
      product.eccn!.toUpperCase().startsWith(eccn.slice(0, 2))
    )

    if (isControlled && EXPORT_RESTRICTED.includes(country)) {
      return {
        riskLevel: 'CRITICAL',
        message: `ECCN ${product.eccn} item blocked for export to ${country}`,
        requiresLicense: true,
      }
    }

    if (isControlled && EXPORT_LICENSED.includes(country)) {
      return {
        riskLevel: 'HIGH',
        message: `ECCN ${product.eccn} item requires BIS license for ${country}`,
        requiresLicense: true,
      }
    }

    if (isControlled) {
      return {
        riskLevel: 'MEDIUM',
        message: `ECCN ${product.eccn} item may require export license review`,
        requiresLicense: false,
      }
    }
  }

  return {
    riskLevel: 'LOW',
    message: 'No export control restrictions identified',
    requiresLicense: false,
  }
}
