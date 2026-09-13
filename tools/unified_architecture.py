from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()

s = s.replace('  normalizedModel?: string;\n  aliases:', '  normalizedModel?: string;\n  compactModel?: string;\n  screenSize?: number;\n  resolution?: string;\n  aliases:')
s = s.replace('type SearchResult = { device: Device;', 'type SearchResult = { deviceId: string; model: string; brand: string; device: Device;')
s = s.replace('type SavedConfig = { deviceId: string;', 'type SavedConfig = { id?: string; deviceId: string;')
s = s.replace('createdAt: string; };\ntype HistoryItem', 'source?: "database" | "estimated"; createdAt: string; updatedAt?: string; };\ntype HistoryItem')

# Central search API after rankedMatches.
needle = '''function rankedMatches(query: string) {\n  const exact = devices.flatMap((device) => {\n    const matchType = exactMatchType(query, device);\n    return matchType ? [{ device, score: 100, matchType }] : [];\n  });\n  if (exact.length) return exact.sort((a, b) => a.device.model.length - b.device.model.length);\n  return devices.map((device) => ({ device, score: fuzzyScore(query, device), matchType: "fuzzy" as const })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);\n}\n'''
replacement = needle + '''\nfunction searchDevice(query: string) {\n  const match = rankedMatches(query)[0];\n  if (!match) return null;\n  const exact = exactMatchType(query, match.device);\n  const matchType = exact || (match.score >= 74 ? "fuzzy" : "fuzzy");\n  return { deviceId: match.device.id, device: match.device, model: match.device.model, brand: match.device.brand, matchType, confidence: exact ? 1 : match.score >= 74 ? 0.86 : 0.76, correctedQuery: exact ? undefined : `${match.device.brand} ${match.device.model}`, source: "database" as const };\n}\n'''
if 'function searchDevice(query' not in s:
    s = s.replace(needle, replacement)

# New persistence key names, with backward-compatible migration.
s = s.replace('toHistoryItems(loadJson("sua-history", []))', 'toHistoryItems(loadJson("dn_sua_history", loadJson("sua-history", [])))')
s = s.replace('toFavoriteItems(loadJson("sua-favorites", []))', 'toFavoriteItems(loadJson("dn_sua_favorites", loadJson("sua-favorites", [])))')
s = s.replace('toHistoryItems(loadJson("sua-saved-configs", []))', 'toHistoryItems(loadJson("dn_sua_saved_configs", loadJson("sua-saved-configs", [])))')
s = s.replace('localStorage.setItem("sua-history", JSON.stringify(history))', 'localStorage.setItem("dn_sua_history", JSON.stringify(history))')
s = s.replace('localStorage.setItem("sua-favorites", JSON.stringify(favorites))', 'localStorage.setItem("dn_sua_favorites", JSON.stringify(favorites))')
s = s.replace('localStorage.setItem("sua-saved-configs", JSON.stringify(savedConfigs))', 'localStorage.setItem("dn_sua_saved_configs", JSON.stringify(savedConfigs))')

# Profile key migration and null-first profile semantics.
s = s.replace('localStorage.getItem("sua-profile-committed") !== "1"', 'localStorage.getItem("dn_sua_profile") === null && localStorage.getItem("sua-profile-committed") !== "1"')
s = s.replace('JSON.parse(localStorage.getItem("sua-profile") || "null")', 'JSON.parse(localStorage.getItem("dn_sua_profile") || localStorage.getItem("sua-profile") || "null")')
s = s.replace('localStorage.setItem("sua-profile", JSON.stringify({ deviceId: profileDevice.id, profile, fps, dpi }))', 'localStorage.setItem("dn_sua_profile", JSON.stringify({ name: "SÚA", currentDeviceId: profileDevice.id, deviceId: profileDevice.id, profile, fps, dpi }))')

# Search submit paths use centralized searchDevice.
s = s.replace('const currentMatches = rankedMatches(event.currentTarget.value); const target = currentMatches[0]?.device ||', 'const currentMatch = searchDevice(event.currentTarget.value); const target = currentMatch?.device ||')
s = s.replace('const currentMatches = rankedMatches(query); const target = currentMatches[0]?.device ||', 'const currentMatch = searchDevice(query); const target = currentMatch?.device ||')

# Analyze result object includes stable id/model/brand and uses search result metadata.
s = s.replace('const matched = exactMatchType(query, device);\n      const matchType = device.id.startsWith("generated-") ? "estimated" : (matched || "fuzzy");\n      const confidence = matchType === "estimated" ? 0.62 : matchType === "fuzzy" ? 0.84 : 1;', 'const centralMatch = searchDevice(query);\n      const matched = centralMatch?.device.id === device.id ? centralMatch.matchType : exactMatchType(`${device.brand} ${device.model}`, device);\n      const matchType = device.id.startsWith("generated-") ? "estimated" : (matched || "exact-brand-model");\n      const confidence = matchType === "estimated" ? 0.62 : matchType === "fuzzy" ? 0.86 : 1;')
s = s.replace('setSearchResult({ device, matchType, confidence, correctedQuery:', 'setSearchResult({ deviceId: device.id, model: device.model, brand: device.brand, device, matchType, confidence, correctedQuery:')

# Saved config receives stable id/source/timestamps.
s = s.replace('const saved: SavedConfig = { deviceId: selectedDevice.id, deviceName:', 'const saved: SavedConfig = { id: `${selectedDevice.id}:${createdAt}`, source: selectedDevice.id.startsWith("generated-") ? "estimated" : "database", updatedAt: createdAt, deviceId: selectedDevice.id, deviceName:')
s = s.replace('const saved: SavedConfig = { deviceId: selectedDevice.id, deviceName:', 'const saved: SavedConfig = { id: `${selectedDevice.id}:${createdAt}`, source: selectedDevice.id.startsWith("generated-") ? "estimated" : "database", updatedAt: createdAt, deviceId: selectedDevice.id, deviceName:')

p.write_text(s)
