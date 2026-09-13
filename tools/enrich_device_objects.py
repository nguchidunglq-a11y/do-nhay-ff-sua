from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()
needle = '  { id: "ipad-pro-m2", brand: "Apple", model: "iPad Pro M2", aliases: ["ipad pro", "ipad m2", "ipad pro m2"], type: "TABLET", tier: "FLAGSHIP", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 9, os: "iPadOS", score: 96, gradient: "from-sky-400/20 to-teal-500/5", accent: "#66e5e5" },\n];\n\nconst brands'
replacement = '  { id: "ipad-pro-m2", brand: "Apple", model: "iPad Pro M2", aliases: ["ipad pro", "ipad m2", "ipad pro m2"], type: "TABLET", tier: "FLAGSHIP", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 9, os: "iPadOS", score: 96, gradient: "from-sky-400/20 to-teal-500/5", accent: "#66e5e5" },\n].map((device) => ({ ...device, normalizedModel: normalize(device.model), compactModel: compactNormalize(device.model), screenSize: device.screenSize ?? (device.type === "TABLET" ? 12.9 : 6.5), resolution: device.resolution ?? "unknown" }));\n\nconst brands'
if needle not in s: raise SystemExit('device array ending not found')
p.write_text(s.replace(needle, replacement))
