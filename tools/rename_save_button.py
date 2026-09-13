from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()
s = s.replace('{selectedDevice && isFavorite ? "ĐÃ LƯU" : "LƯU"}', '{selectedDevice && isFavorite ? "ĐÃ LƯU" : "LƯU HỒ SƠ"}')
p.write_text(s)
