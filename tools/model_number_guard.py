from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()

s = s.replace('  compactModel?: string;\n  screenSize?: number;', '  compactModel?: string;\n  series?: string;\n  modelNumber?: string;\n  variant?: string;\n  screenSize?: number;')

needle = 'function fuzzyScore(query: string, device: Device) {'
helper = '''function parseDeviceQuery(query: string) {\n  const normalized = normalize(query);\n  const series = /\\b(neo|z|galaxy s|galaxy a|galaxy z|note|iphone|redmi note|xiaomi|pixel|rog)\\b/i.exec(normalized)?.[1]?.toLowerCase() || (normalized.startsWith("s") ? "s" : undefined);\n  const modelNumber = normalized.match(/(?:neo|galaxy\\s+[saz]|iphone|redmi\\s+note|xiaomi|pixel|rog|z|s)\\s*(\\d{1,3})\\b/i)?.[1];\n  const variant = /\\b(pro\\s+max|pro\\+|pro|ultra|plus|fe|se|max|mini|lite|turbo\\s+pro)\\b/i.exec(normalized)?.[1]?.toLowerCase() || "base";\n  const brand = /\\b(iqoo|samsung|apple|iphone|xiaomi|redmi|rog|asus|oneplus|oppo|vivo|realme|pixel|google)\\b/i.exec(normalized)?.[1]?.toLowerCase();\n  return { normalized, brand, series, modelNumber, variant };\n}\n\nfunction deviceIdentity(device: Device) {\n  const parsed = parseDeviceQuery(`${device.brand} ${device.model}`);\n  return { brand: parsed.brand || device.brand.toLowerCase(), series: parsed.series, modelNumber: parsed.modelNumber, variant: parsed.variant };\n}\n\nfunction isCompatibleModel(queryInfo: ReturnType<typeof parseDeviceQuery>, device: Device) {\n  const info = deviceIdentity(device);\n  if (queryInfo.brand && !info.brand.includes(queryInfo.brand) && !queryInfo.brand.includes(info.brand)) return false;\n  if (queryInfo.series && info.series && queryInfo.series !== info.series) return false;\n  if (queryInfo.modelNumber && info.modelNumber && queryInfo.modelNumber !== info.modelNumber) return false;\n  if (queryInfo.modelNumber && !info.modelNumber) return false;\n  if (queryInfo.variant && queryInfo.variant !== "base" && info.variant !== queryInfo.variant) return false;\n  return true;\n}\n\n'''
if 'function parseDeviceQuery' not in s:
    s = s.replace(needle, helper + needle)

# Replace fuzzy candidate list with compatibility-filtered candidates.
old = '  return devices.map((device) => ({ device, score: fuzzyScore(query, device), matchType: "fuzzy" as const })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);'
new = '  const queryInfo = parseDeviceQuery(query);\n  return devices.filter((device) => isCompatibleModel(queryInfo, device)).map((device) => ({ device, score: fuzzyScore(query, device), matchType: "fuzzy" as const })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);'
if old not in s: raise SystemExit('fuzzy candidate line not found')
s = s.replace(old, new)

# Replace fallback constructor with series-aware identity preserving model number.
start = s.index('function createFallbackDevice(query: string): Device {')
end = s.index('\n\nfunction sensitivityCacheKey', start)
fallback = '''function createFallbackDevice(query: string): Device {\n  const clean = query.trim().replace(/\\s+/g, " ");\n  const parsed = parseDeviceQuery(clean);\n  const isIqooSeries = parsed.series === "neo" || parsed.series === "z" || /^iqoo\\b/i.test(clean);\n  const inferredBrand = isIqooSeries ? "iQOO" : (clean.match(/^[A-Za-z]+/)?.[0] || "Unknown");\n  const displayModel = isIqooSeries && parsed.series && parsed.modelNumber ? `${parsed.series[0].toUpperCase()}${parsed.series.slice(1)} ${parsed.modelNumber}${parsed.variant !== "base" ? ` ${parsed.variant}` : ""}` : (clean.replace(new RegExp(`^${inferredBrand}\\\\s*`, "i"), "") || clean);\n  const displayName = `${inferredBrand} ${displayModel}`.trim();\n  const slug = normalize(displayName).replace(/\\s+/g, "-");\n  return { id: `generated-${slug}`, brand: inferredBrand, model: displayModel, aliases: [], type: "PHONE", tier: "MIDRANGE", refreshRate: 90, touchSampling: 0, ram: 8, processorLevel: 6, os: "Android", score: 62, gradient: "from-slate-400/20 to-cyan-500/5", accent: "#9ab7bd", series: parsed.series, modelNumber: parsed.modelNumber, variant: parsed.variant };\n}\n'''
s = s[:start] + fallback + s[end:]

# Deep-link unknown generated result should reconstruct the same fallback, not null.
old = '    const device = deviceId ? devices.find((entry) => entry.id === deviceId) : null;\n    if (device) { setQuery(`${device.brand} ${device.model}`); analyze(device); }'
new = '    const device = deviceId ? devices.find((entry) => entry.id === deviceId) || (deviceId.startsWith("generated-") ? createFallbackDevice(deviceId.replace(/^generated-/, "").replace(/-/g, " ")) : null) : null;\n    if (device) { setQuery(`${device.brand} ${device.model}`); analyze(device); }'
if old not in s: raise SystemExit('deep link block not found')
s = s.replace(old, new)

p.write_text(s)
