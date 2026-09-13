from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()
old = '    if (type === "profile") setProfile(String(value)); if (type === "fps") setFps(Number(value)); if (type === "weapon") setWeapon(String(value)); if (type === "dpi") setDpi(Number(value));\n    setResult(generateSensitivity(selectedDevice, type === "profile" ? String(value) : profile, type === "fps" ? Number(value) : fps, type === "weapon" ? String(value) : weapon, type === "dpi" ? Number(value) : dpi));'
new = '    if (type === "profile") setProfile(String(value)); if (type === "fps") setFps(Number(value)); if (type === "weapon") setWeapon(String(value)); if (type === "dpi") setDpi(Number(value));\n    const nextProfile = type === "profile" ? String(value) : profile;\n    const nextDpi = type === "profile" ? calculateRecommendedDpi(selectedDevice, nextProfile) : type === "dpi" ? Number(value) : dpi;\n    if (type === "profile") setDpi(nextDpi);\n    setPreviousResult(result);\n    setResult(generateSensitivity(selectedDevice, nextProfile, type === "fps" ? Number(value) : fps, type === "weapon" ? String(value) : weapon, nextDpi));'
if old not in s: raise SystemExit('updateChoice block not found')
p.write_text(s.replace(old, new))
