from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()
if 'const deviceById:' not in s:
    marker = 'const weapons = ["Tất cả", "M1887", "M1014", "MP40"];'
    declarations = '''const deviceById: Record<string, Device> = Object.fromEntries(devices.map((device) => [device.id, device]));\nconst aliasMap: Record<string, string> = Object.fromEntries(devices.flatMap((device) => [device.model, ...device.aliases].map((alias) => [normalize(alias), device.id])));\n'''
    if marker not in s:
        raise SystemExit('stable insertion marker not found')
    s = s.replace(marker, declarations + marker, 1)
p.write_text(s)
