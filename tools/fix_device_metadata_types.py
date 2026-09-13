from pathlib import Path
p = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
s = p.read_text().replace('device.screenSize ?? (device.type === "TABLET" ? 12.9 : 6.5), resolution: device.resolution ?? "unknown"', '(device as Device).screenSize ?? (device.type === "TABLET" ? 12.9 : 6.5), resolution: (device as Device).resolution ?? "unknown"')
p.write_text(s)
