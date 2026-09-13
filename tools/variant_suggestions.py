from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text().replace('match(/\\b\\d+\\b/)', 'match(/\\d+/)')
p.write_text(s)
