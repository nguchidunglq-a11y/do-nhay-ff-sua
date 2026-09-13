from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()

# Explicit maps make exact alias resolution independent from catalog order.
needle = 'const brands = Array.from(new Set(devices.map((device) => device.brand)));'
insert = '''const deviceById: Record<string, Device> = Object.fromEntries(devices.map((device) => [device.id, device]));\nconst aliasMap: Record<string, string> = Object.fromEntries(devices.flatMap((device) => [device.model, ...device.aliases].map((alias) => [normalize(alias), device.id])));\n\n'''
if 'const deviceById:' not in s:
    s = s.replace(needle, insert + needle)

# SearchResult includes the complete identity contract.
s = s.replace('type SearchResult = { deviceId: string; model: string; brand: string; device: Device; matchType:', 'type SearchResult = { deviceId: string; deviceName: string; brand: string; series?: string; modelNumber?: string; variant?: string; model: string; device: Device; matchType:')
s = s.replace('"fuzzy" | "estimated";', '"fuzzy" | "estimated" | "fallback";')

# Exact alias map is checked before broader matching.
needle = 'function rankedMatches(query: string) {\n  const exact = devices.flatMap((device) => {'
replacement = 'function rankedMatches(query: string) {\n  const aliasId = aliasMap[normalize(query)] || aliasMap[compactNormalize(query)];\n  if (aliasId && deviceById[aliasId]) return [{ device: deviceById[aliasId], score: 100, matchType: "exact-alias" as const }];\n  const exact = devices.flatMap((device) => {'
if needle not in s: raise SystemExit('rankedMatches marker not found')
s = s.replace(needle, replacement)

# Central search result carries deviceName and parsed identity.
s = s.replace('return { deviceId: match.device.id, device: match.device, model: match.device.model, brand: match.device.brand, matchType, confidence:', 'return { deviceId: match.device.id, deviceName: `${match.device.brand} ${match.device.model}`, device: match.device, model: match.device.model, brand: match.device.brand, series: deviceIdentity(match.device).series, modelNumber: deviceIdentity(match.device).modelNumber, variant: deviceIdentity(match.device).variant, matchType, confidence:')

# Fallback is a first-class result type.
s = s.replace('const matchType: SearchResult["matchType"] = device.id.startsWith("generated-") ? "estimated" :', 'const matchType: SearchResult["matchType"] = device.id.startsWith("generated-") ? "fallback" :')
s = s.replace('const confidence = matchType === "estimated" ? 0.62 : matchType === "fuzzy" ? 0.86 : 1;', 'const confidence = matchType === "fallback" ? 0 : matchType === "estimated" ? 0.62 : matchType === "fuzzy" ? 0.86 : 1;')
s = s.replace('setSearchResult({ deviceId: device.id, model: device.model, brand: device.brand, device, matchType,', 'setSearchResult({ deviceId: device.id, deviceName: `${device.brand} ${device.model}`, model: device.model, brand: device.brand, series: device.series, modelNumber: device.modelNumber, variant: device.variant, device, matchType,')
s = s.replace('source: device.id.startsWith("generated-") ? "estimated" : "database"', 'source: device.id.startsWith("generated-") ? "estimated" : "database"')

p.write_text(s)
