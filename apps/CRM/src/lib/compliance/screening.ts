// Mock denied party screening service
// Replace with real BIS/OFAC API in production

export interface ScreeningResult {
  status: 'CLEAR' | 'FLAGGED' | 'BLOCKED' | 'REVIEW_REQUIRED'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  matches: Array<{ name: string; list: string; score: number }>
  message: string
}

const RESTRICTED_COUNTRIES = ['IR', 'KP', 'SY', 'CU']
const WATCHED_COUNTRIES = ['RU', 'CN', 'MM', 'VE', 'BY']

const MOCK_DENIED_PARTIES = [
  { name: 'Acme Weapons Corp', list: 'SDN', country: 'IR' },
  { name: 'Shadow Tech Industries', list: 'Entity List', country: 'CN' },
  { name: 'Northern Defense LLC', list: 'SDN', country: 'KP' },
]

export async function screenEntity(entity: {
  name: string
  country: string
}): Promise<ScreeningResult> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Check restricted countries
  if (RESTRICTED_COUNTRIES.includes(entity.country.toUpperCase())) {
    return {
      status: 'BLOCKED',
      riskLevel: 'CRITICAL',
      matches: [
        { name: entity.name, list: 'Country Restriction', score: 100 },
      ],
      message: `Entity located in restricted country (${entity.country})`,
    }
  }

  // Check watched countries
  if (WATCHED_COUNTRIES.includes(entity.country.toUpperCase())) {
    return {
      status: 'REVIEW_REQUIRED',
      riskLevel: 'HIGH',
      matches: [
        { name: entity.name, list: 'Country Watch List', score: 75 },
      ],
      message: `Entity located in watched country (${entity.country}). Manual review required.`,
    }
  }

  // Check name against mock denied party list
  const nameMatches = MOCK_DENIED_PARTIES.filter((dp) =>
    entity.name.toLowerCase().includes(dp.name.toLowerCase()) ||
    dp.name.toLowerCase().includes(entity.name.toLowerCase())
  )

  if (nameMatches.length > 0) {
    return {
      status: 'FLAGGED',
      riskLevel: 'HIGH',
      matches: nameMatches.map((m) => ({
        name: m.name,
        list: m.list,
        score: 85,
      })),
      message: `Potential match found on ${nameMatches[0].list}`,
    }
  }

  return {
    status: 'CLEAR',
    riskLevel: 'LOW',
    matches: [],
    message: 'No matches found',
  }
}
