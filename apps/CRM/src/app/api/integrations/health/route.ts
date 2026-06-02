import { NextResponse } from 'next/server'
import { checkAllModulesHealth, getAllModules } from '@/lib/integration'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const health = await checkAllModulesHealth()
    const modules = getAllModules().map((m) => ({
      ...m,
      online: health[m.name] ?? false,
    }))
    const connected = modules.filter((m) => m.online).length
    return NextResponse.json({ modules, connected, total: modules.length })
  } catch {
    return NextResponse.json({ modules: [], connected: 0, total: 0 })
  }
}
