import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Loader2, Users, Mail, Phone, BookOpen } from "lucide-react";

export default function SchoolTeachers() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "", class_assigned: "" });

  const { data: teachers, isLoading } = useQuery({
    queryKey: ["school-teachers-manage", schoolId],
    enabled: !!schoolId,
    queryFn: () => api.schoolTeachers(schoolId!),
  });

  const createTeacher = useMutation({
    mutationFn: async () => api.createSchoolTeacher(form),
    onSuccess: (created: any) => {
      toast.success("Teacher created. Assigned class saved successfully.");
      if (created?.teacher && schoolId) {
        qc.setQueryData(["school-teachers-manage", schoolId], (old: any[] | undefined) => [created.teacher, ...(old ?? [])]);
      }
      setForm({ full_name: "", email: "", password: "", phone: "", class_assigned: "" });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["school-teachers-manage", schoolId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DashboardLayout role="school">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
            <p className="text-muted-foreground text-sm mt-1">Add teachers and assign them to classes</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" /> Add Teacher</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Teacher Login</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
                <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Password *</Label><Input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Assign Class *</Label><Input value={form.class_assigned} onChange={e => setForm({ ...form, class_assigned: e.target.value })} placeholder="e.g. Class 8-A" /></div>
                <p className="text-xs text-muted-foreground">An account will be created instantly. Share these credentials with the teacher.</p>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createTeacher.mutate()}
                  disabled={!form.full_name || !form.email || form.password.length < 6 || !form.class_assigned || createTeacher.isPending}
                >
                  {createTeacher.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create Login
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers?.map((t: any) => (
              <Card key={t.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="w-5 h-5 text-primary" /> {t.full_name ?? t.email}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {t.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4" />{t.email}</p>}
                  {t.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" />{t.phone}</p>}
                  <p className="flex items-center gap-2"><BookOpen className="w-4 h-4" />Class: {t.class_assigned ?? "—"}</p>
                </CardContent>
              </Card>
            ))}
            {teachers?.length === 0 && <p className="text-muted-foreground text-sm">No teachers yet. Add your first one.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
