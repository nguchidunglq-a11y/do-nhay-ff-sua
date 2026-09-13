from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text().replace('const matchType = device.id.startsWith("generated-") ? "estimated" : (matched || "exact-brand-model");', 'const matchType: SearchResult["matchType"] = device.id.startsWith("generated-") ? "estimated" : (matched || "exact-brand-model") as SearchResult["matchType"];')
p.write_text(s)
