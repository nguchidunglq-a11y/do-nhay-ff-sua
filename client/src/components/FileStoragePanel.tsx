import { useRef, useState } from "react";
import { Cloud, Download, FileArchive, FileImage, FileText, LockKeyhole, LogIn, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      resolve(value.includes(",") ? value.slice(value.indexOf(",") + 1) : value);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Không thể đọc file"));
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <FileImage size={18} />;
  if (mimeType.includes("pdf") || mimeType.includes("text") || mimeType.includes("json")) return <FileText size={18} />;
  return <FileArchive size={18} />;
}

export default function FileStoragePanel() {
  const { user, isAuthenticated } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const filesQuery = trpc.files.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: async () => {
      await filesQuery.refetch();
      toast.success("Đã lưu tệp vào Cloud Vault");
    },
    onError: (error) => toast.error(error.message || "Upload thất bại"),
  });

  const onChooseFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      toast.error("File tối đa 50MB");
      return;
    }
    setIsUploading(true);
    try {
      const dataBase64 = await readAsBase64(file);
      await uploadMutation.mutateAsync({ fileName: file.name, mimeType: file.type || "application/octet-stream", size: file.size, dataBase64 });
    } catch (error) {
      if (!(error instanceof Error) || !error.message) toast.error("Không thể upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return <section className="container vault-section" id="vault">
    <div className="vault-card">
      <div className="vault-heading">
        <div className="vault-title-wrap"><div className="vault-icon"><Cloud size={21} /></div><div><p className="eyebrow"><span className="eyebrow-line" /> CLOUD VAULT / PRIVATE STORAGE</p><h2>Lưu trữ tệp SÚA</h2><p className="vault-subtitle">Lưu preset, ảnh HUD và file cấu hình an toàn theo tài khoản của bạn.</p></div></div>
        {isAuthenticated && <span className="vault-user"><span className="live-dot" /> {user?.name || user?.email || "ĐÃ ĐĂNG NHẬP"}</span>}
      </div>
      {!isAuthenticated ? <div className="vault-login"><LockKeyhole size={20} /><div><strong>Kho tệp riêng tư</strong><span>Đăng nhập để lưu và truy cập tệp trên mọi thiết bị.</span></div><button className="vault-login-button" onClick={() => startLogin()}><LogIn size={15} /> ĐĂNG NHẬP</button></div> : <>
        <div className="vault-dropzone"><input ref={inputRef} type="file" onChange={onChooseFile} accept="image/*,.json,.txt,.pdf,.zip" hidden /><div className="vault-drop-icon"><Upload size={21} /></div><div><strong>{isUploading ? "Đang tải lên Cloud Vault..." : "Thêm file vào kho"}</strong><span>JSON, ảnh, PDF, ZIP · tối đa 50MB</span></div><button className="vault-upload-button" onClick={() => inputRef.current?.click()} disabled={isUploading}>{isUploading ? "ĐANG UPLOAD" : "CHỌN FILE"}</button></div>
        <div className="vault-file-list">{filesQuery.isLoading ? <div className="vault-empty">Đang tải danh sách file...</div> : filesQuery.data?.length ? filesQuery.data.map((file) => <div className="vault-file-row" key={file.id}><div className="vault-file-type"><FileIcon mimeType={file.mimeType} /></div><div className="vault-file-name"><strong>{file.fileName}</strong><span>{formatSize(file.size)} · {new Date(file.createdAt).toLocaleDateString("vi-VN")}</span></div><a className="vault-download" href={file.url} target="_blank" rel="noreferrer" title="Mở file"><Download size={15} /></a></div>) : <div className="vault-empty"><FileText size={20} /><span>Kho tệp đang trống</span><small>Upload preset đầu tiên của bạn</small></div>}</div>
      </>}
    </div>
  </section>;
}
