from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()
s = s.replace('if (event.key === "Enter" && matches[0]) { selectDevice(matches[0].device); analyze(matches[0].device); }', 'if (event.key === "Enter") { const currentMatches = rankedMatches(event.currentTarget.value); const target = currentMatches[0]?.device || (event.currentTarget.value.trim() ? createFallbackDevice(event.currentTarget.value) : undefined); analyze(target); }')
s = s.replace('onClick={() => { const target = matches[0]?.device || (query.trim() ? createFallbackDevice(query) : undefined); analyze(target); }}', 'onClick={() => { const currentMatches = rankedMatches(query); const target = currentMatches[0]?.device || (query.trim() ? createFallbackDevice(query) : undefined); analyze(target); }}')
p.write_text(s)
