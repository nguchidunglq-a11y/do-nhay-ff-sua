import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  CheckCircle2,
  Copy,
  Crosshair,
  Gauge,
  Heart,
  History,
  Menu,
  MonitorSmartphone,
  MousePointer2,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import FileStoragePanel from "@/components/FileStoragePanel";

type Device = {
  id: string;
  brand: string;
  model: string;
  normalizedModel?: string;
  aliases: string[];
  type: string;
  tier: string;
  refreshRate: number;
  touchSampling: number;
  ram: number;
  processorLevel: number;
  os: string;
  score: number;
  gradient: string;
  accent: string;
};

type Sensitivity = {
  general: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  sniper: number;
  camera360: number;
  fireButton: number;
  dpi: number;
};

type SearchResult = { device: Device; matchType: "exact-model" | "exact-alias" | "exact-brand-model" | "token" | "fuzzy" | "estimated"; confidence: number; correctedQuery?: string; source: "database" | "estimated"; sensitivity: Sensitivity; createdAt: string; };
type SavedConfig = { deviceId: string; deviceName: string; brand: string; profile: string; fps: number; general: number; redDot: number; scope2x: number; scope4x: number; sniper: number; camera360: number; fireButton: number; dpi: number; createdAt: string; };
type HistoryItem = SavedConfig;
type FavoriteItem = { deviceId: string; deviceName: string; createdAt: string; };

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

function toHistoryItems(value: unknown): HistoryItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): HistoryItem[] => {
    if (typeof item === "object" && item && "deviceId" in item && "deviceName" in item) return [item as HistoryItem];
    if (typeof item === "string") {
      const device = devices.find((entry) => entry.model === item || `${entry.brand} ${entry.model}` === item);
      return device ? [{ deviceId: device.id, deviceName: `${device.brand} ${device.model}`, brand: device.brand, profile: "Kéo tâm", fps: 144, general: 0, redDot: 0, scope2x: 0, scope4x: 0, sniper: 0, camera360: 0, fireButton: 0, dpi: 470, createdAt: new Date().toISOString() }] : [];
    }
    return [];
  });
}

function toFavoriteItems(value: unknown): FavoriteItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): FavoriteItem[] => {
    if (typeof item === "object" && item && "deviceId" in item && "deviceName" in item) return [item as FavoriteItem];
    if (typeof item === "string") {
      const device = devices.find((entry) => entry.id === item);
      return device ? [{ deviceId: device.id, deviceName: `${device.brand} ${device.model}`, createdAt: new Date().toISOString() }] : [];
    }
    return [];
  });
}

const devices: Device[] = [
  { id: "iqoo-neo-10", brand: "iQOO", model: "Neo 10", aliases: ["neo10", "iqoo neo10", "neo 10"], type: "PHONE", tier: "GAMING", refreshRate: 144, touchSampling: 2000, ram: 12, processorLevel: 9, os: "Android", score: 98, gradient: "from-lime-400/20 to-emerald-500/5", accent: "#c9ff3c" },
  { id: "samsung-s23-ultra", brand: "Samsung", model: "Galaxy S23 Ultra", aliases: ["s23 ultra", "s23u", "galaxy s23 ultra", "samsung s23", "samsung s23 ultra"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 120, touchSampling: 240, ram: 12, processorLevel: 9, os: "Android", score: 95, gradient: "from-cyan-400/20 to-blue-500/5", accent: "#58d6ff" },
  { id: "samsung-s23", brand: "Samsung", model: "Galaxy S23", aliases: ["s23", "samsung s23", "galaxy s23"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 8, os: "Android", score: 94, gradient: "from-cyan-300/15 to-blue-400/5", accent: "#6edcff" },
  { id: "samsung-s23-plus", brand: "Samsung", model: "Galaxy S23+", aliases: ["s23+", "s23 plus", "samsung s23 plus", "galaxy s23 plus"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 8, os: "Android", score: 94, gradient: "from-cyan-300/15 to-blue-400/5", accent: "#6edcff" },
  { id: "samsung-s23-fe", brand: "Samsung", model: "Galaxy S23 FE", aliases: ["s23 fe", "samsung s23 fe", "galaxy s23 fe"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 120, touchSampling: 120, ram: 8, processorLevel: 7, os: "Android", score: 90, gradient: "from-cyan-300/15 to-blue-400/5", accent: "#6edcff" },
  { id: "iphone-xs", brand: "Apple", model: "iPhone XS", aliases: ["iphone xs", "iphonexs", "apple xs", "xs"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 60, touchSampling: 120, ram: 4, processorLevel: 7, os: "iOS", score: 91, gradient: "from-violet-400/20 to-fuchsia-500/5", accent: "#c7a4ff" },
  { id: "samsung-s22-ultra", brand: "Samsung", model: "Galaxy S22 Ultra", aliases: ["s22 ultra", "s22u", "galaxy s22 ultra", "samsung s22", "samsung s22 ultra"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 8, os: "Android", score: 93, gradient: "from-blue-400/20 to-indigo-500/5", accent: "#83b8ff" },
  { id: "redmi-note-13-pro", brand: "Xiaomi", model: "Redmi Note 13 Pro", aliases: ["redmi note 13 pro", "note 13 pro", "redmi 13 pro"], type: "PHONE", tier: "MIDRANGE", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 7, os: "Android", score: 89, gradient: "from-orange-300/20 to-rose-500/5", accent: "#ffb87a" },
  { id: "redmi-note-14", brand: "Redmi", model: "Redmi Note 14", aliases: ["note 14", "redmi note14", "redmi note 14"], type: "PHONE", tier: "MIDRANGE", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 7, os: "Android", score: 88, gradient: "from-orange-300/20 to-rose-500/5", accent: "#ffb87a" },
  { id: "rog-phone-8", brand: "ROG", model: "Phone 8", aliases: ["rog 8", "rog phone 8", "asus rog 8"], type: "PHONE", tier: "GAMING", refreshRate: 165, touchSampling: 720, ram: 16, processorLevel: 10, os: "Android", score: 99, gradient: "from-red-400/20 to-orange-500/5", accent: "#ff7d7d" },
  { id: "ipad-pro-m2", brand: "Apple", model: "iPad Pro M2", aliases: ["ipad pro", "ipad m2", "ipad pro m2"], type: "TABLET", tier: "FLAGSHIP", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 9, os: "iPadOS", score: 96, gradient: "from-sky-400/20 to-teal-500/5", accent: "#66e5e5" },
];

const brands = ["Samsung", "iPhone", "iQOO", "Xiaomi", "Redmi", "ROG", "OnePlus", "vivo", "OPPO", "realme"];
const weapons = ["Tất cả", "M1887", "M1014", "MP40"];
const profiles = ["Ổn định", "Cân bằng", "Kéo tâm", "Headshot", "M1887"];
const fpsOptions = [60, 90, 120, 144, 165];
const sensitivityLabels: [keyof Sensitivity, string][] = [
  ["general", "Chung"], ["redDot", "Red Dot"], ["scope2x", "2X"], ["scope4x", "4X"], ["sniper", "Sniper"], ["camera360", "Camera 360"], ["fireButton", "Nút bắn"],
];

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

function compactNormalize(text: string) {
  return normalize(text).replace(/[^a-z0-9+]/g, "");
}

function exactMatchType(query: string, device: Device) {
  const q = normalize(query);
  const compact = compactNormalize(query);
  const model = normalize(device.normalizedModel || device.model);
  const brandModel = normalize(`${device.brand} ${device.model}`);
  const aliases = device.aliases.map(normalize);
  if (q === model || compact === compactNormalize(model)) return "exact-model" as const;
  if (aliases.some((alias) => q === alias || compact === compactNormalize(alias))) return "exact-alias" as const;
  if (q === brandModel || compact === compactNormalize(brandModel)) return "exact-brand-model" as const;
  const queryTokens = q.split(" ").filter(Boolean);
  const modelTokens = model.split(" ");
  if (queryTokens.length > 0 && queryTokens.length === modelTokens.length && queryTokens.every((token, index) => token === modelTokens[index])) return "token" as const;
  return null;
}

function fuzzyScore(query: string, device: Device) {
  const q = compactNormalize(query);
  if (!q) return 0;
  const terms = [device.model, `${device.brand} ${device.model}`, ...device.aliases].map(compactNormalize);
  return Math.max(...terms.map((term) => {
    if (term === q) return 100;
    if (term.startsWith(q)) return 74;
    if (term.includes(q)) return 58;
    let common = 0;
    for (const char of q) if (term.includes(char)) common++;
    return common / Math.max(q.length, 1) > 0.78 ? 42 : 0;
  }));
}

function rankedMatches(query: string) {
  const exact = devices.flatMap((device) => {
    const matchType = exactMatchType(query, device);
    return matchType ? [{ device, score: 100, matchType }] : [];
  });
  if (exact.length) return exact.sort((a, b) => a.device.model.length - b.device.model.length);
  return devices.map((device) => ({ device, score: fuzzyScore(query, device), matchType: "fuzzy" as const })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
}


function createFallbackDevice(query: string): Device {
  const clean = query.trim().replace(/\s+/g, " ");
  const [brand = "Unknown", ...rest] = clean.split(" ");
  return { id: `generated-${normalize(clean)}`, brand, model: rest.join(" ") || clean, aliases: [], type: "PHONE", tier: "MIDRANGE", refreshRate: 90, touchSampling: 180, ram: 8, processorLevel: 6, os: "Android", score: 62, gradient: "from-slate-400/20 to-cyan-500/5", accent: "#9ab7bd" };
}

function generateSensitivity(device: Device, profile: string, fps: number, weapon: string, dpi: number): Sensitivity {
  const tierBoost = device.tier === "GAMING" ? 5 : device.tier === "FLAGSHIP" ? 3 : 0;
  const profileBoost = profile === "Kéo tâm" || profile === "Headshot" ? 4 : profile === "Ổn định" ? -2 : 0;
  const weaponBoost = weapon === "M1887" ? 3 : weapon === "MP40" ? 1 : 0;
  const fpsBoost = fps >= 144 ? 2 : fps <= 60 ? -3 : 0;
  const base = 168 + tierBoost + profileBoost + weaponBoost + fpsBoost + Math.round((device.refreshRate - 60) / 40);
  return { general: Math.min(200, base), redDot: Math.min(200, base - 6), scope2x: Math.min(200, base - 14), scope4x: Math.min(200, base - 21), sniper: Math.max(60, base - 90), camera360: Math.min(200, base + 5), fireButton: Math.max(45, Math.min(80, 55 + profileBoost + (weapon === "M1887" ? 4 : 0))), dpi };
}

function Logo() {
  return <div className="logo-mark" aria-label="Độ Nhạy FF SÚA logo"><svg viewBox="0 0 40 40" role="img"><circle cx="20" cy="20" r="13" /><path d="M20 2v8M20 30v8M2 20h8M30 20h8M14 14l12 12M26 14 14 26" /><circle cx="20" cy="20" r="3" /></svg><div><span>SÚA</span><small>ĐỘ NHẠY FF</small></div></div>;
}

function Pill({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={`pill ${active ? "pill-active" : ""}`}>{children}</button>;
}

function EmptyState({ query, onUse }: { query: string; onUse: () => void }) {
  return <div className="fallback-card fade-up"><div className="fallback-icon"><SlidersHorizontal size={22} /></div><div><p className="eyebrow">THIẾT BỊ CHƯA CÓ CẤU HÌNH RIÊNG</p><h3>{query || "Thiết bị mới"}</h3><p className="muted">Thông số ước lượng — dùng để tạo cấu hình tham khảo. Bạn có thể tinh chỉnh thông số bên dưới.</p></div><button className="outline-button" onClick={onUse}>Tạo cấu hình <ArrowRight size={15} /></button></div>;
}

const savedProfile = (() => {
  if (typeof window === "undefined" || localStorage.getItem("sua-profile-committed") !== "1") return null;
  try { return JSON.parse(localStorage.getItem("sua-profile") || "null") as { deviceId?: string; profile?: string; fps?: number; dpi?: number } | null; } catch { return null; }
})();

export default function Home() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [profileDevice, setProfileDevice] = useState<Device | null>(() => devices.find((device) => device.id === savedProfile?.deviceId) || null);
  const [result, setResult] = useState<Sensitivity | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [previousResult, setPreviousResult] = useState<Sensitivity | null>(null);
  const [profile, setProfile] = useState(savedProfile?.profile || "Kéo tâm");
  const [fps, setFps] = useState(savedProfile?.fps || 144);
  const [weapon, setWeapon] = useState("M1887");
  const [dpi, setDpi] = useState(savedProfile?.dpi || 470);
  const [loading, setLoading] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [history, setHistory] = useState<HistoryItem[]>(() => toHistoryItems(loadJson("sua-history", [])));
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => toFavoriteItems(loadJson("sua-favorites", [])));
  const [savedConfigs, setSavedConfigs] = useState<HistoryItem[]>(() => toHistoryItems(loadJson("sua-saved-configs", [])));
  const searchRef = useRef<HTMLInputElement>(null);
  const latestRequestId = useRef(0);

  useEffect(() => { const timer = window.setTimeout(() => setDebouncedQuery(query), 180); return () => window.clearTimeout(timer); }, [query]);
  const matches = useMemo(() => rankedMatches(debouncedQuery), [debouncedQuery]);
  const isFavorite = Boolean(selectedDevice && favorites.some((item) => item.deviceId === selectedDevice.id));

  useEffect(() => { localStorage.setItem("sua-history", JSON.stringify(history)); }, [history]);
  useEffect(() => { if (profileDevice) { localStorage.setItem("sua-profile", JSON.stringify({ deviceId: profileDevice.id, profile, fps, dpi })); } }, [profileDevice, profile, fps, dpi]);
  useEffect(() => { localStorage.setItem("sua-favorites", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem("sua-saved-configs", JSON.stringify(savedConfigs)); }, [savedConfigs]);
  useEffect(() => { const key = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); } }; window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, []);

  const selectDevice = (device: Device) => { setSelectedDevice(device); setQuery(`${device.brand} ${device.model}`); setSuggestionsOpen(false); };
  const analyze = (device?: Device) => {
    if (!device) { toast.info("Nhập tên thiết bị để bắt đầu"); return; }
    const requestId = ++latestRequestId.current;
    setSelectedDevice(device);
    setResult(null);
    setLoading(true); setSuggestionsOpen(false); setActiveSection("home");
    window.setTimeout(() => {
      if (requestId !== latestRequestId.current) return;
      const next = generateSensitivity(device, profile, fps, weapon, dpi);
      const createdAt = new Date().toISOString();
      const matched = exactMatchType(query, device);
      const matchType = device.id.startsWith("generated-") ? "estimated" : (matched || "fuzzy");
      const confidence = matchType === "estimated" ? 0.62 : matchType === "fuzzy" ? 0.84 : 1;
      setResult(next);
      setSearchResult({ device, matchType, confidence, correctedQuery: matchType === "fuzzy" ? `${device.brand} ${device.model}` : undefined, source: device.id.startsWith("generated-") ? "estimated" : "database", sensitivity: next, createdAt });
      setProfileDevice(device);
      localStorage.setItem("sua-profile-committed", "1");
      const saved: SavedConfig = { deviceId: device.id, deviceName: `${device.brand} ${device.model}`, brand: device.brand, profile, fps, general: next.general, redDot: next.redDot, scope2x: next.scope2x, scope4x: next.scope4x, sniper: next.sniper, camera360: next.camera360, fireButton: next.fireButton, dpi: next.dpi, createdAt };
      setLoading(false);
      setHistory((old) => [saved, ...old.filter((item) => item.deviceId !== device.id)].slice(0, 5));
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast.success(`Đã phân tích cấu hình cho ${device.brand} ${device.model}`);
    }, 760);
  };
  const updateSensitivity = (key: keyof Sensitivity, value: number) => { if (!result) return; setPreviousResult(result); setResult((old) => old ? ({ ...old, [key]: value }) : old); };
  const updateChoice = (type: "profile" | "fps" | "weapon" | "dpi", value: string | number) => {
    if (!selectedDevice || !result) return;
    if (type === "profile") setProfile(String(value)); if (type === "fps") setFps(Number(value)); if (type === "weapon") setWeapon(String(value)); if (type === "dpi") setDpi(Number(value));
    setResult(generateSensitivity(selectedDevice, type === "profile" ? String(value) : profile, type === "fps" ? Number(value) : fps, type === "weapon" ? String(value) : weapon, type === "dpi" ? Number(value) : dpi));
  };
  const clearSearch = () => { ++latestRequestId.current; setQuery(""); setDebouncedQuery(""); setSuggestionsOpen(false); setSelectedDevice(null); setSearchResult(null); setResult(null); setPreviousResult(null); setLoading(false); };
  const copyResult = async () => { if (!selectedDevice || !result) return; const text = `${selectedDevice.brand} ${selectedDevice.model}\nĐộ nhạy FF SÚA\n${sensitivityLabels.map(([key, label]) => `${label}: ${result[key]}`).join("\n")}\nDPI: ${result.dpi}`; await navigator.clipboard?.writeText(text); toast.success("Đã copy cấu hình độ nhạy"); };
  const toggleFavorite = () => {
    if (!selectedDevice) return;
    const createdAt = new Date().toISOString();
    const next = { deviceId: selectedDevice.id, deviceName: `${selectedDevice.brand} ${selectedDevice.model}`, createdAt };
    if (result) {
      const saved: SavedConfig = { deviceId: selectedDevice.id, deviceName: next.deviceName, brand: selectedDevice.brand, profile, fps, general: result.general, redDot: result.redDot, scope2x: result.scope2x, scope4x: result.scope4x, sniper: result.sniper, camera360: result.camera360, fireButton: result.fireButton, dpi: result.dpi, createdAt };
      setSavedConfigs((old) => [saved, ...old.filter((item) => item.deviceId !== saved.deviceId)].slice(0, 12));
    }
    setFavorites((old) => old.some((item) => item.deviceId === next.deviceId) ? old.filter((item) => item.deviceId !== next.deviceId) : [next, ...old]);
    toast.success(isFavorite ? "Đã cập nhật cấu hình trong hồ sơ" : "Đã lưu đúng thiết bị vào hồ sơ");
  };
  const share = async () => {
    if (!selectedDevice) return;
    const url = `${window.location.origin}/result?device=${encodeURIComponent(selectedDevice.id)}`;
    window.history.pushState({}, "", `/result?device=${encodeURIComponent(selectedDevice.id)}`);
    const shareText = `Độ nhạy FF SÚA — ${selectedDevice.brand} ${selectedDevice.model}\n${url}`;
    if (navigator.share) await navigator.share({ title: "Độ Nhạy FF SÚA", text: shareText, url }); else { await navigator.clipboard?.writeText(url); toast.success("Đã copy link cấu hình"); }
  };
  useEffect(() => {
    const deviceId = new URLSearchParams(window.location.search).get("device");
    const device = deviceId ? devices.find((entry) => entry.id === deviceId) : null;
    if (device) { setQuery(`${device.brand} ${device.model}`); analyze(device); }
  }, []);
  const navTo = (section: string) => { setActiveSection(section); if (section === "home") window.scrollTo({ top: 0, behavior: "smooth" }); else document.getElementById(section)?.scrollIntoView({ behavior: "smooth" }); };

  return <div className="app-shell">
    <div className="noise" />
    <header className="site-header"><div className="header-inner"><Logo /><nav className="desktop-nav"><button className={activeSection === "home" ? "nav-active" : ""} onClick={() => navTo("home")}>Trang chủ</button><button onClick={() => navTo("result")}>Cấu hình</button><button onClick={() => navTo("library")}>Thư viện</button></nav><div className="header-search" onClick={() => searchRef.current?.focus()}><Search size={16} /><span>{query || "Tìm độ nhạy FF theo thiết bị..."}</span><kbd>⌘ K</kbd></div><div className="header-actions"><button className="icon-button" onClick={() => toast.info("Cài đặt giao diện sẽ sớm ra mắt")} aria-label="Cài đặt"><Settings2 size={18} /></button><button className="avatar-button" onClick={() => navTo("profile")} aria-label="Mở profile">S</button><button className="mobile-menu" onClick={() => toast.info("Menu mobile đang được tối ưu hóa")}><Menu size={20} /></button></div></div></header>

    <main>
      <section className="hero" id="home"><div className="hero-grid" /><div className="hero-glow glow-one" /><div className="hero-glow glow-two" /><div className="container hero-content"><div className="status-line"><span className="live-dot" /> ENGINE ONLINE <span className="status-divider" /> V2.4.0 <span className="status-divider" /> <span className="status-green">99.9% READY</span></div><div className="hero-copy"><div className="hero-kicker"><Crosshair size={16} /> SMART SENSITIVITY ENGINE</div><h1>ĐỘ NHẠY FF<br /><em>SÚA</em></h1><p>Tìm và tạo độ nhạy Free Fire phù hợp — tinh chỉnh theo thiết bị, FPS và lối chơi của bạn.</p></div><div className="search-stage"><div className={`main-search ${suggestionsOpen ? "search-focused" : ""}`}><Search size={22} className="search-symbol" /><input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); setSuggestionsOpen(true); }} onFocus={() => setSuggestionsOpen(true)} onKeyDown={(event) => { if (event.key === "Escape") setSuggestionsOpen(false); if (event.key === "Enter") { const currentMatches = rankedMatches(event.currentTarget.value); const target = currentMatches[0]?.device || (event.currentTarget.value.trim() ? createFallbackDevice(event.currentTarget.value) : undefined); analyze(target); } }} placeholder="iQOO Neo 10, Samsung S23 Ultra, iPhone XS..." aria-label="Tìm độ nhạy FF theo thiết bị" />{query && <button className="clear-search" onClick={clearSearch}><X size={17} /></button>}<button className="analyze-button" onClick={() => { const currentMatches = rankedMatches(query); const target = currentMatches[0]?.device || (query.trim() ? createFallbackDevice(query) : undefined); analyze(target); }}><Sparkles size={16} /> AUTO PHÂN TÍCH <ArrowRight size={16} /></button></div>{suggestionsOpen && query && <div className="suggestions"><div className="suggestion-head"><span>GỢI Ý</span><span>ENTER ĐỂ CHỌN</span></div>{matches.length ? matches.map(({ device }, index) => <button key={device.id} className="suggestion-item" onClick={() => selectDevice(device)}><span className="suggestion-index">0{index + 1}</span><span className="suggestion-device"><strong>{device.brand} {device.model}</strong><small>{device.type} / {device.tier}</small></span><ArrowRight size={16} /></button>) : <div className="no-match"><CircleHelp size={17} /> Có phải bạn muốn tìm <strong>{query}</strong>?</div>}</div>}</div><div className="brand-suggestions"><span>GỢI Ý NHANH</span>{brands.map((brand) => <button key={brand} onClick={() => { setQuery(brand); setSuggestionsOpen(true); }}>{brand}</button>)}</div></div></section>

      <section className="container section-block"><div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> DATA LIBRARY / 07</p><h2>Thiết bị phổ biến</h2></div><button className="text-button" onClick={() => toast.info("Đang hiển thị toàn bộ thiết bị")}>Xem tất cả <ArrowRight size={15} /></button></div><div className="device-grid">{devices.slice(0, 4).map((device) => <button key={device.id} className={`device-card bg-gradient-to-br ${device.gradient}`} onClick={() => { selectDevice(device); analyze(device); }}><div className="device-top"><span className="device-brand">{device.brand}</span><span className="device-type">{device.type}</span></div><div className="device-name">{device.model}</div><div className="device-meta"><span><Gauge size={13} /> {device.refreshRate}Hz</span><span><Zap size={13} /> {device.touchSampling}Hz touch</span></div><div className="device-score"><span>ACCURACY INDEX</span><strong style={{ color: device.accent }}>{device.score}</strong></div><div className="device-orbit"><Target size={52} style={{ color: device.accent }} /></div></button>)}</div></section>

      {(loading || searchResult) && <section className="container section-block split-section" id="result"><div className="section-heading result-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> ANALYSIS OUTPUT / LIVE</p><h2>Độ nhạy FF đề xuất</h2></div><div className="result-actions"><button className="small-icon-button" onClick={() => analyze(selectedDevice || undefined)} title="Phân tích lại"><RotateCcw size={15} /></button><button className={`favorite-button ${selectedDevice && isFavorite ? "is-favorite" : ""}`} onClick={toggleFavorite}><Heart size={15} fill={selectedDevice && isFavorite ? "currentColor" : "none"} /> {selectedDevice && isFavorite ? "ĐÃ LƯU" : "LƯU HỒ SƠ"}</button></div></div><div className="result-layout"><div className="result-card">{loading ? <div className="analysis-loading"><div className="scan-ring"><Crosshair size={29} /></div><div><p className="eyebrow">PHÂN TÍCH ĐỘ NHẠY FF</p><h3>Đang phân tích {selectedDevice?.brand} {selectedDevice?.model}...</h3><div className="loading-bar"><span /></div><small>Nhận diện thiết bị · kiểm tra database · tính DPI</small></div></div> : selectedDevice && result ? <><div className="result-device"><div className="result-device-icon"><MonitorSmartphone size={22} /></div><div><span className="eyebrow">DEVICE MATCH / {selectedDevice.type}</span><h3>{selectedDevice.brand} {selectedDevice.model}</h3><div className="result-tags"><span>{selectedDevice.tier}</span><span>{selectedDevice.refreshRate}Hz</span><span>{selectedDevice.os}</span><span className="verified"><ShieldCheck size={12} /> {selectedDevice.score >= 90 ? "VERIFIED DATA" : "ESTIMATED DATA"}</span></div></div><div className="match-score"><strong>{selectedDevice.score}%</strong><span>algorithm fit</span></div></div><div className="confidence-block"><div className="confidence-copy"><span>ĐỘ TIN CẬY DỮ LIỆU</span><strong>{selectedDevice.score}%</strong></div><div className="confidence-track"><span style={{ width: `${selectedDevice.score}%` }} /></div><small><CheckCircle2 size={13} /> {selectedDevice.score >= 90 ? "Thông số thiết bị đã biết" : "Thông số ước lượng — nên tinh chỉnh thêm"}</small></div><div className="sensitivity-list">{sensitivityLabels.map(([key, label]) => <div className="sensitivity-row" key={key}><span>{label}</span><div className="sensitivity-control"><div className="sensitivity-track"><span style={{ width: `${result[key] / 2}%` }} /></div><input className="sensitivity-range" aria-label={`Chỉnh ${label}`} type="range" min="0" max="200" value={result[key]} onChange={(event) => updateSensitivity(key, Number(event.target.value))} /></div><strong>{result[key]}</strong></div>)}</div><div className="result-footer"><span><Activity size={15} /> ENGINE PRESET: {profile.toUpperCase()}</span><span>UPDATED JUST NOW</span></div></> : null}</div>{selectedDevice && result && <aside className="control-panel"><div className="panel-header"><div><span className="eyebrow">FINE TUNING</span><h3>Chỉnh cấu hình</h3></div><SlidersHorizontal size={18} /></div><div className="control-group"><label>PROFILE</label><div className="pill-grid">{profiles.map((item) => <Pill key={item} active={profile === item} onClick={() => updateChoice("profile", item)}>{item}</Pill>)}</div></div><div className="control-group"><label>FPS TARGET</label><div className="pill-grid fps-grid">{fpsOptions.map((item) => <Pill key={item} active={fps === item} onClick={() => updateChoice("fps", item)}>{item}</Pill>)}</div></div><div className="control-group"><label>VŨ KHÍ ƯU TIÊN</label><div className="select-wrap"><select value={weapon} onChange={(event) => updateChoice("weapon", event.target.value)}>{weapons.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} /></div></div><div className="control-group"><div className="label-row"><label>DPI <span className="label-value">{dpi}</span></label><span className="range-caption">420 — 560</span></div><input className="range-input" type="range" min="420" max="560" step="10" value={dpi} onChange={(event) => updateChoice("dpi", Number(event.target.value))} /></div><div className="panel-actions"><button className="primary-action" onClick={copyResult}><Copy size={15} /> COPY CONFIG</button><button className="secondary-action" onClick={share}>CHIA SẺ</button></div></aside>}</div></section>}

      <section className="container profile-strip" id="profile-summary"><div className="profile-intro"><div className="profile-avatar">S</div><div><p className="eyebrow"><span className="eyebrow-line" /> CẤU HÌNH CỦA TÔI</p><h2>Hồ sơ SÚA</h2><p>{profileDevice ? "Reload web vẫn giữ thiết bị và preset bạn đang dùng." : "Phân tích một thiết bị để bắt đầu hồ sơ của bạn."}</p></div></div><div className="profile-stat"><span>THIẾT BỊ HIỆN TẠI</span><strong>{profileDevice ? `${profileDevice.brand} ${profileDevice.model}` : "Chưa chọn"}</strong><small>{profileDevice ? `${profileDevice.tier} · ${profileDevice.refreshRate}Hz` : "Đang chờ phân tích"}</small></div><div className="profile-stat"><span>CẤU HÌNH ĐANG DÙNG</span><strong>{profileDevice ? profile : "Chưa có"}</strong><small>{profileDevice ? `${fps} FPS · DPI ${dpi}` : "—"}</small></div><div className="profile-stat"><span>CẤU HÌNH ĐÃ LƯU</span><strong>{savedConfigs.length}</strong><small>{history.length} lần tìm gần nhất</small></div></section>

{selectedDevice && result && (
      <section className="container compare-section" id="compare"><div className="section-heading compact"><div><p className="eyebrow"><span className="eyebrow-line" /> SO SÁNH / DELTA VIEW</p><h2>Cấu hình hiện tại ↔ đề xuất</h2></div><span className="compare-note">Thay đổi được highlight</span></div><div className="compare-grid">{sensitivityLabels.slice(0, 6).map(([key, label]) => { const baseline = previousResult?.[key] ?? result[key]; const delta = result[key] - baseline; return <div className="compare-row" key={key}><span>{label}</span><strong className={delta ? "compare-changed" : ""}>{baseline}</strong><ArrowRight size={14} /><strong className={delta ? "compare-changed" : ""}>{result[key]}</strong><small>{delta > 0 ? `+${delta}` : delta || "—"}</small></div>; })}<div className="compare-row"><span>DPI</span><strong>{previousResult?.dpi ?? 470}</strong><ArrowRight size={14} /><strong className={result.dpi !== (previousResult?.dpi ?? 470) ? "compare-changed" : ""}>{result.dpi}</strong><small>{result.dpi - (previousResult?.dpi ?? 470) > 0 ? `+${result.dpi - (previousResult?.dpi ?? 470)}` : result.dpi - (previousResult?.dpi ?? 470) || "—"}</small></div></div></section>
      )}

      <section className="container lower-grid" id="library"><div className="activity-card"><div className="section-heading compact"><div><p className="eyebrow"><span className="eyebrow-line" /> RECENT ACTIVITY</p><h2>Lịch sử gần đây</h2></div><History size={18} /></div>{history.length ? <div className="activity-list">{history.map((item, index) => <button key={`${item.deviceId}-${index}`} onClick={() => { const device = devices.find((entry) => entry.id === item.deviceId) || createFallbackDevice(item.deviceName); setQuery(item.deviceName); analyze(device); }}><span className="activity-number">0{index + 1}</span><span><strong>{item.deviceName}</strong><small>{item.profile} · {item.fps} FPS · DPI {item.dpi}</small></span><ArrowRight size={15} /></button>)}</div> : <div className="empty-activity"><History size={24} /><span>Chưa có lịch sử phân tích</span><small>Chọn một thiết bị để bắt đầu</small></div>}</div><div className="favorites-card" id="profile"><div className="section-heading compact"><div><p className="eyebrow"><span className="eyebrow-line" /> YOUR COLLECTION</p><h2>Độ nhạy yêu thích</h2></div><Heart size={18} /></div>{favorites.length ? <div className="favorite-list">{favorites.map((item) => { const device = devices.find((entry) => entry.id === item.deviceId); return device ? <button key={item.deviceId} onClick={() => { selectDevice(device); analyze(device); }}><span className="favorite-dot" style={{ background: device.accent }} /><span>{item.deviceName}</span><ArrowRight size={15} /></button> : null; })}</div> : <div className="empty-activity"><Heart size={24} /><span>Lưu cấu hình bạn thích</span><small>Nhấn LƯU sau khi phân tích thiết bị</small></div>}</div></section>
      <FileStoragePanel />
    </main>

    <footer className="site-footer"><div className="container footer-grid"><div><Logo /><p>Công cụ tìm kiếm và tạo độ nhạy<br />Free Fire cho mọi thiết bị.</p></div><div><span className="footer-label">KHÁM PHÁ</span><button onClick={() => navTo("home")}>Trang chủ</button><button onClick={() => navTo("result")}>Tìm kiếm</button><button onClick={() => navTo("library")}>Lịch sử & yêu thích</button><button onClick={() => navTo("vault")}>Cloud Vault</button></div><div><span className="footer-label">ENGINE</span><span className="footer-status"><span className="live-dot" /> Smart analyzer online</span><span className="footer-status"><ShieldCheck size={13} /> Dữ liệu được kiểm chứng</span></div><div><span className="footer-label">SÚA / 2026</span><p className="footer-note">Độ nhạy là cấu hình đề xuất và có thể cần tinh chỉnh theo từng thiết bị và cách chơi.</p></div></div><div className="container footer-bottom"><span>© 2026 ĐỘ NHẠY FF SÚA. BUILT FOR ACCURACY.</span><span>PRIVACY / TERMS</span></div></footer>
  </div>;
}
