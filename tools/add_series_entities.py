from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()
needle = '  { id: "iqoo-neo-10", brand: "iQOO", model: "Neo 10", aliases: ["neo10", "iqoo neo10", "neo 10"], type: "PHONE", tier: "GAMING", refreshRate: 144, touchSampling: 2000, ram: 12, processorLevel: 9, os: "Android", score: 98, gradient: "from-lime-400/20 to-emerald-500/5", accent: "#c9ff3c" },'
variants = '''  { id: "iqoo-z11", brand: "iQOO", model: "Z11", aliases: ["z11", "iqoo z11", "iqo z11"], type: "PHONE", tier: "MIDRANGE", refreshRate: 120, touchSampling: 360, ram: 8, processorLevel: 7, os: "Android", score: 90, gradient: "from-lime-400/15 to-emerald-500/5", accent: "#c9ff3c" },\n  { id: "iqoo-z10", brand: "iQOO", model: "Z10", aliases: ["z10", "iqoo z10"], type: "PHONE", tier: "MIDRANGE", refreshRate: 120, touchSampling: 360, ram: 8, processorLevel: 7, os: "Android", score: 89, gradient: "from-lime-400/15 to-emerald-500/5", accent: "#c9ff3c" },\n  { id: "iqoo-z10-turbo-pro", brand: "iQOO", model: "Z10 Turbo Pro", aliases: ["z10 turbo pro", "iqoo z10 turbo pro", "z10t pro"], type: "PHONE", tier: "GAMING", refreshRate: 144, touchSampling: 2000, ram: 12, processorLevel: 9, os: "Android", score: 96, gradient: "from-lime-400/20 to-emerald-500/5", accent: "#c9ff3c" },\n''' + needle
if 'id: "iqoo-z11"' not in s:
    s = s.replace(needle, variants)
needle2 = '  { id: "redmi-note-13", brand: "Redmi", model: "Redmi Note 13", aliases: ["redmi note 13", "note 13"], type: "PHONE", tier: "MIDRANGE", refreshRate: 120, touchSampling: 240, ram: 8, processorLevel: 7, os: "Android", score: 89, gradient: "from-orange-300/20 to-rose-500/5", accent: "#ffb87a" },'
xi = needle2 + '\n  { id: "xiaomi-14", brand: "Xiaomi", model: "Xiaomi 14", aliases: ["xiaomi14", "xiaomi 14"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 120, touchSampling: 480, ram: 12, processorLevel: 9, os: "Android", score: 94, gradient: "from-orange-300/20 to-rose-500/5", accent: "#ffb87a" },\n  { id: "xiaomi-14-ultra", brand: "Xiaomi", model: "Xiaomi 14 Ultra", aliases: ["xiaomi 14 ultra", "xiaomi14 ultra"], type: "PHONE", tier: "FLAGSHIP", refreshRate: 120, touchSampling: 480, ram: 16, processorLevel: 10, os: "Android", score: 97, gradient: "from-orange-300/20 to-rose-500/5", accent: "#ffb87a" },'
if 'id: "xiaomi-14"' not in s:
    s = s.replace(needle2, xi)
p.write_text(s)
