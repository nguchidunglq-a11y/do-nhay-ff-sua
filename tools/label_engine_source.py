from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()
s = s.replace('<span>UPDATED JUST NOW</span>', '<span>{searchResult?.source === "estimated" ? "CẤU HÌNH ƯỚC LƯỢNG" : "DỮ LIỆU THIẾT BỊ"}</span>')
p.write_text(s)
