from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()
needle = 'const brands = ["Samsung", "iPhone", "iQOO", "Xiaomi", "Redmi", "ROG", "OnePlus", "vivo", "OPPO", "realme"];'
insert = 'const deviceById: Record<string, Device> = Object.fromEntries(devices.map((device) => [device.id, device]));\nconst aliasMap: Record<string, string> = Object.fromEntries(devices.flatMap((device) => [device.model, ...device.aliases].map((alias) => [normalize(alias), device.id])));\n\n'
if 'const deviceById:' not in s:
    s = s.replace(needle, insert + needle)
p.write_text(s)
