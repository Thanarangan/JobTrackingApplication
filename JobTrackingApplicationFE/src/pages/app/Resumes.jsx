import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, Trash2, File } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import apiClient from "@/api/apiClient";
import { useAuth } from "@/auth/AuthProvider";
const Resumes = () => {
    const { user } = useAuth();
    const [resumes, setResumes] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);
    const mapResume = (r) => ({
        id: r.id,
        filename: r.fileName,
        uploadedAt: r.uploadedAt?.split("T")[0] || "",
        type: r.contentType || "FILE",
    });
    const fetchResumes = useCallback(async () => {
        if (!user?.id) {
            setResumes([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.get(`/api/resumes/user/${user.id}`);
            setResumes(res.data.map(mapResume));
        }
        catch (err) {
            toast.error(err?.response?.data?.message || "Failed to load resumes");
        }
        finally {
            setLoading(false);
        }
    }, [user?.id]);
    useEffect(() => {
        fetchResumes();
    }, [fetchResumes]);
    const handleFiles = async (files) => {
        if (!files)
            return;
        if (!user?.id) {
            toast.error("User not found");
            return;
        }
        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("userId", String(user.id));
                formData.append("file", file);
                await apiClient.post("/api/resumes/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            await fetchResumes();
            toast.success(`${files.length} resume(s) uploaded`);
        }
        catch (err) {
            toast.error(err?.response?.data?.message || "Failed to upload resume");
        }
        finally {
            setUploading(false);
            if (inputRef.current)
                inputRef.current.value = "";
        }
    };
    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/api/resumes/${id}`);
            setResumes((prev) => prev.filter((r) => r.id !== id));
            toast.success("Resume deleted");
        }
        catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete resume");
        }
    };
    const handleDownload = async (resume) => {
        try {
            const res = await apiClient.get(`/api/resumes/${resume.id}/download`, {
                responseType: "blob",
            });
            const blobUrl = URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = resume.filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        }
        catch (err) {
            toast.error(err?.response?.data?.message || "Failed to download resume");
        }
    };
    return (<div>
      <h1 className="text-3xl font-bold">Resume Vault</h1>
      <p className="mt-1 text-muted-foreground">Upload and manage your resumes securely.</p>

      <div onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
        }} onDragLeave={() => setDragging(false)} onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
        }} onClick={() => inputRef.current?.click()} className={`mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all ${dragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"}`}>
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" multiple hidden onChange={(e) => handleFiles(e.target.files)}/>
        {uploading ? (<div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"/>
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>) : (<>
            <div className="rounded-2xl gradient-primary-soft p-4">
              <Upload className="h-8 w-8 text-primary"/>
            </div>
            <p className="mt-4 text-sm font-semibold">Drop files here or click to upload</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
          </>)}
      </div>

      {loading ? (<div className="mt-16 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"/>
        </div>) : resumes.length === 0 ? (<div className="mt-16 flex flex-col items-center text-center">
          <div className="rounded-2xl gradient-primary-soft p-6">
            <FileText className="h-12 w-12 text-primary"/>
          </div>
          <h3 className="mt-6 text-lg font-bold">No resumes yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Upload your first resume to get started.</p>
        </div>) : (<div className="mt-8 space-y-3">
          {resumes.map((r, i) => (<motion.div key={r.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="rounded-xl gradient-primary-soft p-2.5">
                  <File className="h-5 w-5 text-primary"/>
                </div>
                <div>
                  <p className="font-semibold text-sm">{r.filename}</p>
                  <p className="text-xs text-muted-foreground">{r.type} | {r.uploadedAt}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleDownload(r)}>
                  <Download className="h-4 w-4"/>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete resume?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently remove "{r.filename}".</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(r.id)} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>))}
        </div>)}
    </div>);
};
export default Resumes;
