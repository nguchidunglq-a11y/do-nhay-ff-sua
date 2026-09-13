from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()
needle = '  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => toFavoriteItems(loadJson("sua-favorites", [])));'
s = s.replace(needle, needle + '\n  const [savedConfigs, setSavedConfigs] = useState<HistoryItem[]>(() => toHistoryItems(loadJson("sua-saved-configs", [])));')
s = s.replace('  useEffect(() => { localStorage.setItem("sua-favorites", JSON.stringify(favorites)); }, [favorites]);', '  useEffect(() => { localStorage.setItem("sua-favorites", JSON.stringify(favorites)); }, [favorites]);\n  useEffect(() => { localStorage.setItem("sua-saved-configs", JSON.stringify(savedConfigs)); }, [savedConfigs]);')
old = '''    const next = { deviceId: selectedDevice.id, deviceName: `${selectedDevice.brand} ${selectedDevice.model}`, createdAt: new Date().toISOString() };\n    setFavorites((old) => old.some((item) => item.deviceId === next.deviceId) ? old.filter((item) => item.deviceId !== next.deviceId) : [next, ...old]);\n    toast.success(isFavorite ? "Đã bỏ khỏi yêu thích" : "Đã lưu vào yêu thích");'''
new = '''    const createdAt = new Date().toISOString();\n    const next = { deviceId: selectedDevice.id, deviceName: `${selectedDevice.brand} ${selectedDevice.model}`, createdAt };\n    if (result) {\n      const saved: SavedConfig = { deviceId: selectedDevice.id, deviceName: next.deviceName, brand: selectedDevice.brand, profile, fps, general: result.general, redDot: result.redDot, scope2x: result.scope2x, scope4x: result.scope4x, sniper: result.sniper, camera360: result.camera360, fireButton: result.fireButton, dpi: result.dpi, createdAt };\n      setSavedConfigs((old) => [saved, ...old.filter((item) => item.deviceId !== saved.deviceId)].slice(0, 12));\n    }\n    setFavorites((old) => old.some((item) => item.deviceId === next.deviceId) ? old.filter((item) => item.deviceId !== next.deviceId) : [next, ...old]);\n    toast.success(isFavorite ? "Đã cập nhật cấu hình trong hồ sơ" : "Đã lưu đúng thiết bị vào hồ sơ");'''
if old not in s: raise SystemExit('toggle block not found')
s = s.replace(old, new)
s = s.replace('<strong>{favorites.length}</strong><small>{history.length} lần tìm gần nhất</small>', '<strong>{savedConfigs.length}</strong><small>{history.length} lần tìm gần nhất</small>')
s = s.replace('{selectedDevice && favorites.includes(selectedDevice.id) ? "ĐÃ LƯU" : "LƯU"}', '{isFavorite ? "ĐÃ LƯU" : "LƯU HỒ SƠ"}')
p.write_text(s)
