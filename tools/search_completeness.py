from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()

# Add distinct variants required by the end-to-end search examples.
needle = '  { id: "iphone-xs", brand: "Apple", model: "iPhone XS", aliases: ["iphone xs", "iphonexs", "apple xs", "xs"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 60, touchSampling: 120, ram: 4, processorLevel: 7, os: "iOS", score: 91, gradient: "from-violet-400/20 to-fuchsia-500/5", accent: "#c7a4ff" },'
variants = needle + '\n  { id: "iphone-15", brand: "Apple", model: "iPhone 15", aliases: ["iphone15", "iphone 15", "apple iphone 15"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 60, touchSampling: 120, ram: 6, processorLevel: 8, os: "iOS", score: 93, gradient: "from-violet-400/20 to-fuchsia-500/5", accent: "#c7a4ff" },\n  { id: "iphone-15-plus", brand: "Apple", model: "iPhone 15 Plus", aliases: ["iphone 15 plus", "iphone15 plus"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 60, touchSampling: 120, ram: 6, processorLevel: 8, os: "iOS", score: 93, gradient: "from-violet-400/20 to-fuchsia-500/5", accent: "#c7a4ff" },\n  { id: "iphone-15-pro", brand: "Apple", model: "iPhone 15 Pro", aliases: ["iphone 15 pro", "iphone15 pro"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 9, os: "iOS", score: 96, gradient: "from-violet-400/20 to-fuchsia-500/5", accent: "#c7a4ff" },\n  { id: "iphone-15-pro-max", brand: "Apple", model: "iPhone 15 Pro Max", aliases: ["iphone 15 pro max", "iphone15 pro max"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 10, os: "iOS", score: 97, gradient: "from-violet-400/20 to-fuchsia-500/5", accent: "#c7a4ff" },'
if 'iphone-15-pro-max' not in s:
    s = s.replace(needle, variants)
needle = '  { id: "iqoo-neo-10", brand: "iQOO", model: "Neo 10", aliases: ["neo10", "iqoo neo10", "neo 10"], type: "PHONE", tier: "GAMING", refreshRate: 144, touchSampling: 2000, ram: 12, processorLevel: 9, os: "Android", score: 98, gradient: "from-lime-400/20 to-emerald-500/5", accent: "#c9ff3c" },'
variants = needle + '\n  { id: "iqoo-neo-10-pro", brand: "iQOO", model: "Neo 10 Pro", aliases: ["neo 10 pro", "neo10 pro", "iqoo neo 10 pro"], type: "PHONE", tier: "GAMING", refreshRate: 144, touchSampling: 2000, ram: 12, processorLevel: 10, os: "Android", score: 99, gradient: "from-lime-400/20 to-emerald-500/5", accent: "#c9ff3c" },'
if 'iqoo-neo-10-pro' not in s:
    s = s.replace(needle, variants)
needle = '  { id: "redmi-note-13-pro", brand: "Xiaomi", model: "Redmi Note 13 Pro", aliases: ["redmi note 13 pro", "note 13 pro", "redmi 13 pro"], type: "PHONE", tier: "MIDRANGE", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 7, os: "Android", score: 89, gradient: "from-orange-300/20 to-rose-500/5", accent: "#ffb87a" },'
variants = '  { id: "redmi-note-13", brand: "Redmi", model: "Redmi Note 13", aliases: ["redmi note 13", "note 13"], type: "PHONE", tier: "MIDRANGE", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 7, os: "Android", score: 89, gradient: "from-orange-300/20 to-rose-500/5", accent: "#ffb87a" },\n' + needle + '\n  { id: "redmi-note-13-pro-plus", brand: "Redmi", model: "Redmi Note 13 Pro+", aliases: ["redmi note 13 pro+", "redmi note 13 pro plus", "note 13 pro+"], type: "PHONE", tier: "MIDRANGE", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 8, os: "Android", score: 91, gradient: "from-orange-300/20 to-rose-500/5", accent: "#ffb87a" },'
if 'redmi-note-13-pro-plus' not in s:
    s = s.replace(needle, variants)

# Remove a misleading Ultra alias that competes with the exact base S23 entity.
s = s.replace('"galaxy s23 ultra", "samsung s23", "samsung s23 ultra"', '"galaxy s23 ultra", "samsung s23 ultra"')
s = s.replace('"galaxy s22 ultra", "samsung s22", "samsung s22 ultra"', '"galaxy s22 ultra", "samsung s22 ultra"')

# Stable fallback id that preserves the whole query and is URL-safe.
s = s.replace('id: `generated-${normalize(clean)}`', 'id: `generated-${normalize(clean).replace(/\\s+/g, "-")}`')

# Cache helpers.
needle = 'function clamp(value: number, min = 0, max = 200) {'
cache = '''function sensitivityCacheKey(deviceId: string, fps: number, profile: string, weapon: string, dpi: number) {\n  return `sensitivity:${deviceId}:${fps}:${normalize(profile)}:${normalize(weapon)}:${dpi}`;\n}\n\nfunction readSensitivityCache(key: string) {\n  return loadJson<Sensitivity | null>(key, null);\n}\n\n'''
if 'function sensitivityCacheKey' not in s:
    s = s.replace(needle, cache + needle)

# Keep profile state separate from every search.
s = s.replace('      setProfileDevice(device);\n      localStorage.setItem("sua-profile-committed", "1");', '      localStorage.setItem("sua-profile-committed", "1");')

# Use cache in analyze and write a deterministic result for future visits.
s = s.replace('const next = generateSensitivity(device, profile, fps, weapon, engineDpi);', 'const cacheKey = sensitivityCacheKey(device.id, fps, profile, weapon, engineDpi);\n      const next = readSensitivityCache(cacheKey) || generateSensitivity(device, profile, fps, weapon, engineDpi);\n      if (!readSensitivityCache(cacheKey)) localStorage.setItem(cacheKey, JSON.stringify(next));')

# Use cache when controls are changed too.
old = '    setResult(generateSensitivity(selectedDevice, nextProfile, type === "fps" ? Number(value) : fps, type === "weapon" ? String(value) : weapon, nextDpi));'
new = '    const nextFps = type === "fps" ? Number(value) : fps;\n    const nextWeapon = type === "weapon" ? String(value) : weapon;\n    const cacheKey = sensitivityCacheKey(selectedDevice.id, nextFps, nextProfile, nextWeapon, nextDpi);\n    const nextResult = readSensitivityCache(cacheKey) || generateSensitivity(selectedDevice, nextProfile, nextFps, nextWeapon, nextDpi);\n    if (!readSensitivityCache(cacheKey)) localStorage.setItem(cacheKey, JSON.stringify(nextResult));\n    setResult(nextResult);'
if old not in s: raise SystemExit('updateChoice result call not found')
s = s.replace(old, new)

# Offer explicit profile-device action without coupling it to search.
marker = '<div className="profile-stat"><span>THIẾT BỊ HIỆN TẠI</span>'
s = s.replace(marker, '<>{selectedDevice && (!profileDevice || selectedDevice.id !== profileDevice.id) && <button className="profile-commit-button" onClick={() => setProfileDevice(selectedDevice)}>ĐẶT LÀM THIẾT BỊ HIỆN TẠI</button>}</><div className="profile-stat"><span>THIẾT BỊ HIỆN TẠI</span>')

p.write_text(s)
