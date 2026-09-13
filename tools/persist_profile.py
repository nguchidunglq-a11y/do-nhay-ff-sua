from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()
marker = 'export default function Home() {'
if 'const savedProfile' not in s:
    s = s.replace(marker, '''const savedProfile = (() => {\n  if (typeof window === "undefined") return null;\n  try { return JSON.parse(localStorage.getItem("sua-profile") || "null") as { deviceId?: string; profile?: string; fps?: number; dpi?: number } | null; } catch { return null; }\n})();\n\n'''+marker)
s = s.replace('const [selectedDevice, setSelectedDevice] = useState<Device>(devices[0]);', 'const [selectedDevice, setSelectedDevice] = useState<Device>(() => devices.find((device) => device.id === savedProfile?.deviceId) || devices[0]);')
s = s.replace('const [profile, setProfile] = useState("Kéo tâm");', 'const [profile, setProfile] = useState(savedProfile?.profile || "Kéo tâm");')
s = s.replace('const [fps, setFps] = useState(144);', 'const [fps, setFps] = useState(savedProfile?.fps || 144);')
s = s.replace('const [dpi, setDpi] = useState(470);', 'const [dpi, setDpi] = useState(savedProfile?.dpi || 470);')
needle = '  useEffect(() => { localStorage.setItem("sua-history", JSON.stringify(history)); }, [history]);\n'
addition = needle + '  useEffect(() => { localStorage.setItem("sua-profile", JSON.stringify({ deviceId: selectedDevice.id, profile, fps, dpi })); }, [selectedDevice.id, profile, fps, dpi]);\n  useEffect(() => { setResult(generateSensitivity(selectedDevice, profile, fps, weapon, dpi)); }, []);\n'
if 'localStorage.setItem("sua-profile"' not in s:
    s = s.replace(needle, addition)
p.write_text(s)
