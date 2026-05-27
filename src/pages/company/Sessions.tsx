import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, BookOpen, Loader2, Upload, Calendar, School as SchoolIcon } from "lucide-react";

export default function CompanySessions() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    target_school_id: "",
    target_class: "",
    scheduled_at: "",
    duration_minutes: 60,
    meeting_url: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const { data: schools } = useQuery({
    queryKey: ["all-schools"],
    queryFn: api.companySessionSchools,
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["company-sessions"],
    queryFn: api.companySessions,
  });

  const create = useMutation({
    mutationFn: async () => {
      setUploading(true);
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description || "");
      formData.append("target_school_id", form.target_school_id || "");
      formData.append("target_class", form.target_class || "");
      formData.append("scheduled_at", form.scheduled_at);
      formData.append("duration_minutes", String(form.duration_minutes || 30));
      if (file) formData.append("file", file);
      return api.createCompanySession(formData);
    },
    onSuccess: () => {
      toast.success("Session created");
      setOpen(false);
      setFile(null);
      qc.invalidateQueries({ queryKey: ["company-sessions"] });
    },
    onError: (e: any) => toast.error(e.message),
    onSettled: () => setUploading(false),
  });

  const playRecording = async (path: string) => {
    try {
      const data = await api.sessionRecordingUrl(path);
      window.open(data.signedUrl, "_blank");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <DashboardLayout role="company">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Counseling Sessions</h1>
            <p className="text-muted-foreground text-sm mt-1">Upload and schedule sessions for specific schools and classes</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" /> New Session</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Upload / Schedule Session</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>School *</Label>
                    <Select value={form.target_school_id} onValueChange={v => setForm({ ...form, target_school_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                      <SelectContent>
                        {schools?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Class</Label><Input placeholder="e.g. 8-A" value={form.target_class} onChange={e => setForm({ ...form, target_class: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Scheduled At</Label><Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} /></div>
                  <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} /></div>
                </div>
                <div><Label>Meeting URL (optional)</Label><Input placeholder="https://..." value={form.meeting_url} onChange={e => setForm({ ...form, meeting_url: e.target.value })} /></div>
                <div>
                  <Label>Recording File (optional)</Label>
                  <Input type="file" accept="video/*,audio/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  {file && <p className="text-xs text-muted-foreground mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => create.mutate()} disabled={!form.title || !form.target_school_id || uploading}>
                  {uploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  <Upload className="w-4 h-4 mr-1" /> Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions?.map((s: any) => (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="w-5 h-5 text-primary" />{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {s.description && <p className="text-muted-foreground">{s.description}</p>}
                  <p className="flex items-center gap-2 text-muted-foreground"><SchoolIcon className="w-4 h-4" />{s.school_name}{s.target_class ? ` · Class ${s.target_class}` : ""}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" />{new Date(s.scheduled_at).toLocaleString()}</p>
                  <span className={`inline-block text-xs px-2 py-1 rounded-full capitalize ${s.status === "completed" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>{s.status}</span>
                  {s.recording_url && <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => playRecording(s.recording_url)}>Play Recording</Button>}
                  {s.meeting_url && <a href={s.meeting_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline block">Open Meeting Link</a>}
                </CardContent>
              </Card>
            ))}
            {sessions?.length === 0 && <p className="text-muted-foreground text-sm">No sessions yet. Upload your first counseling session.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
