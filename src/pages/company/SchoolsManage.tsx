import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { School, Plus, Loader2, UserPlus, Mail, Phone, MapPin } from "lucide-react";

export default function SchoolsManage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", city: "", contact_email: "", contact_phone: "" });
  const [adminForm, setAdminForm] = useState({ full_name: "", email: "", password: "", phone: "" });

  const { data: schools, isLoading } = useQuery({
    queryKey: ["schools-manage"],
    queryFn: api.companySchools,
  });

  const createSchool = useMutation({
    mutationFn: async () => api.createCompanySchool(form),
    onSuccess: () => {
      toast.success("School created");
      setForm({ name: "", city: "", contact_email: "", contact_phone: "" });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["schools-manage"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const createSchoolAdmin = useMutation({
    mutationFn: async (schoolId: string) => api.createSchoolAdmin(schoolId, {
      full_name: adminForm.full_name,
      email: adminForm.email,
      password: adminForm.password,
      phone: adminForm.phone,
    }),
    onSuccess: () => {
      toast.success("School admin created. Share the credentials with them.");
      setAdminOpen(null);
      setAdminForm({ full_name: "", email: "", password: "", phone: "" });
      qc.invalidateQueries({ queryKey: ["schools-manage"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DashboardLayout role="company">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Schools</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage all schools and create their login credentials</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" /> Add School</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create School</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>City</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                <div><Label>Contact Email</Label><Input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} /></div>
                <div><Label>Contact Phone</Label><Input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button onClick={() => createSchool.mutate()} disabled={!form.name || createSchool.isPending}>
                  {createSchool.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools?.map(s => (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <School className="w-5 h-5 text-primary" /> {s.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {s.city && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" />{s.city}</p>}
                  {s.contact_email && <p className="flex items-center gap-2"><Mail className="w-4 h-4" />{s.contact_email}</p>}
                  {s.contact_phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" />{s.contact_phone}</p>}
                  {s.admin_user_id ? (
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-success/10 text-success mt-2">Admin assigned</span>
                  ) : (
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-warning/10 text-warning mt-2">No admin yet</span>
                  )}
                  <Dialog open={adminOpen === s.id} onOpenChange={(o) => setAdminOpen(o ? s.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        <UserPlus className="w-4 h-4 mr-1" /> {s.admin_user_id ? "Add Another Admin" : "Create School Admin"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Create School Admin Login</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <div><Label>Full Name *</Label><Input value={adminForm.full_name} onChange={e => setAdminForm({ ...adminForm, full_name: e.target.value })} /></div>
                        <div><Label>Email *</Label><Input type="email" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} /></div>
                        <div><Label>Password *</Label><Input type="text" value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} placeholder="Min 6 characters" /></div>
                        <div><Label>Phone</Label><Input value={adminForm.phone} onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })} /></div>
                        <p className="text-xs text-muted-foreground">An account will be created instantly. Share these credentials with the school admin.</p>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => createSchoolAdmin.mutate(s.id)} disabled={!adminForm.full_name || !adminForm.email || adminForm.password.length < 6 || createSchoolAdmin.isPending}>
                          {createSchoolAdmin.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create Login
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
            {schools?.length === 0 && <p className="text-muted-foreground text-sm">No schools yet. Add your first one.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
