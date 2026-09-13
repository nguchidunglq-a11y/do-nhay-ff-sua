from pathlib import Path

path = Path('/home/ubuntu/do-nhay-ff-sua/client/src/pages/Home.tsx')
text = path.read_text()
if 'import FileStoragePanel' not in text:
    text = text.replace('import { toast } from "sonner";\n', 'import { toast } from "sonner";\nimport FileStoragePanel from "@/components/FileStoragePanel";\n')
text = text.replace('  // The useAuth hook provides authentication state.\n  // To implement login/logout, call logout(), or start login from an event\n  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call\n  // startLogin() during render (no href={startLogin()}) — it mints a one-time\n  // nonce cookie and must run only at the moment of navigation.\n  let { user, loading, error, isAuthenticated, logout } = useAuth();\n\n', '')
if '<FileStoragePanel />' not in text:
    text = text.replace('    </main>\n\n    <footer', '      <FileStoragePanel />\n    </main>\n\n    <footer')
path.write_text(text)
