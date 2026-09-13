from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text()
s = s.replace('onClick={() => submitFeedback("Phù hợp")}>Phù hợp</button></div></section>\n\n      <section className="container lower-grid"', 'onClick={() => submitFeedback("Phù hợp")}>Phù hợp</button></div></section>}\n\n      <section className="container lower-grid"')
p.write_text(s)
