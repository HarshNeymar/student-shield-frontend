import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  School,
  Plus,
  Loader2,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Users,
  GraduationCap,
  IndianRupee,
  Eye,
} from "lucide-react";

type SchoolRow = {
  id: string;
  name: string;
  city?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  admin_user_id?: string | null;
  selected_plan_tier?: "basic" | "standard" | "premium" | null;
  teacher_count?: number;
  student_count?: number;
};

export default function SchoolsManage() {
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    city: "",
    contact_email: "",
    contact_phone: "",
  });

  const [adminForm, setAdminForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });

  const { data: schools, isLoading } = useQuery({
    queryKey: ["schools-manage"],
    queryFn: api.companySchools,
  });

  const updateSchoolPlan = useMutation({
  mutationFn: ({
    schoolId,
    selectedPlan,
  }: {
    schoolId: string;
    selectedPlan: string;
  }) => api.updateCompanySchoolPlan(schoolId, selectedPlan),
  onSuccess: () => {
    toast.success("School plan updated");
    qc.invalidateQueries({ queryKey: ["schools-manage"] });

    if (selectedSchoolId) {
      qc.invalidateQueries({
        queryKey: ["company-school-overview", selectedSchoolId],
      });
    }
  },
  onError: (e: any) => toast.error(e.message),
});

  const selectedSchool = useMemo(() => {
    return (
      (schools ?? []).find((s: SchoolRow) => s.id === selectedSchoolId) ?? null
    );
  }, [schools, selectedSchoolId]);

  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useQuery({
    queryKey: ["company-school-overview", selectedSchoolId],
    queryFn: () => api.companySchoolOverview(selectedSchoolId as string),
    enabled: !!selectedSchoolId,
  });

  const createSchool = useMutation({
    mutationFn: async () => api.createCompanySchool(form),
    onSuccess: () => {
      toast.success("School created");
      setForm({
        name: "",
        city: "",
        contact_email: "",
        contact_phone: "",
      });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["schools-manage"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const createSchoolAdmin = useMutation({
    mutationFn: async (schoolId: string) =>
      api.createSchoolAdmin(schoolId, {
        full_name: adminForm.full_name,
        email: adminForm.email,
        password: adminForm.password,
        phone: adminForm.phone,
      }),
    onSuccess: () => {
      toast.success("School admin created");
      setAdminOpen(null);
      setAdminForm({
        full_name: "",
        email: "",
        password: "",
        phone: "",
      });
      qc.invalidateQueries({ queryKey: ["schools-manage"] });

      if (selectedSchoolId) {
        qc.invalidateQueries({
          queryKey: ["company-school-overview", selectedSchoolId],
        });
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DashboardLayout role="company">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Schools</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage schools. Click any school to view its teachers and students.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Add School
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create School</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) =>
                      setForm({ ...form, contact_email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={form.contact_phone}
                    onChange={(e) =>
                      setForm({ ...form, contact_phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => createSchool.mutate()}
                  disabled={!form.name || createSchool.isPending}
                >
                  {createSchool.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(schools ?? []).map((s: SchoolRow) => (
              <Card
                key={s.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSchoolId === s.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedSchoolId(s.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <School className="w-5 h-5 text-primary" />
                    {s.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {s.city && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {s.city}
                    </p>
                  )}

                  {s.contact_email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {s.contact_email}
                    </p>
                  )}

                  {s.contact_phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {s.contact_phone}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-xs">Teachers</p>
                      <p className="font-bold text-foreground">
                        {s.teacher_count ?? 0}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-xs">Students</p>
                      <p className="font-bold text-foreground">
                        {s.student_count ?? 0}
                      </p>
                    </div>
                  </div>

                  <div
  className="pt-3"
  onClick={(e) => e.stopPropagation()}
>
  <Label className="text-xs">Assigned Plan</Label>

  <Select
    value={s.selected_plan_tier ?? "basic"}
    onValueChange={(value) =>
      updateSchoolPlan.mutate({
        schoolId: s.id,
        selectedPlan: value,
      })
    }
  >
    <SelectTrigger className="mt-1">
      <SelectValue placeholder="Select plan" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="basic">Basic Plan — ₹400 yearly</SelectItem>
      <SelectItem value="standard">Standard Plan — ₹800 yearly</SelectItem>
      <SelectItem value="premium">Premium Plan — ₹1200 yearly</SelectItem>
    </SelectContent>
  </Select>
</div>

                  {s.admin_user_id ? (
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 mt-2">
                      Admin assigned
                    </span>
                  ) : (
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 mt-2">
                      No admin yet
                    </span>
                  )}

                  <div
                    className="flex gap-2 pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedSchoolId(s.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Data
                    </Button>

                    <Dialog
                      open={adminOpen === s.id}
                      onOpenChange={(o) => setAdminOpen(o ? s.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <UserPlus className="w-4 h-4 mr-1" />
                          Admin
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create School Admin Login</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-3">
                          <div>
                            <Label>Full Name *</Label>
                            <Input
                              value={adminForm.full_name}
                              onChange={(e) =>
                                setAdminForm({
                                  ...adminForm,
                                  full_name: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div>
                            <Label>Email *</Label>
                            <Input
                              type="email"
                              value={adminForm.email}
                              onChange={(e) =>
                                setAdminForm({
                                  ...adminForm,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div>
                            <Label>Password *</Label>
                            <Input
                              type="text"
                              value={adminForm.password}
                              onChange={(e) =>
                                setAdminForm({
                                  ...adminForm,
                                  password: e.target.value,
                                })
                              }
                              placeholder="Min 6 characters"
                            />
                          </div>

                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={adminForm.phone}
                              onChange={(e) =>
                                setAdminForm({
                                  ...adminForm,
                                  phone: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            onClick={() => createSchoolAdmin.mutate(s.id)}
                            disabled={
                              !adminForm.full_name ||
                              !adminForm.email ||
                              adminForm.password.length < 6 ||
                              createSchoolAdmin.isPending
                            }
                          >
                            {createSchoolAdmin.isPending && (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            )}
                            Create Login
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedSchoolId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5 text-primary" />
                {selectedSchool?.name ?? "School"} Data
              </CardTitle>
            </CardHeader>

            <CardContent>
              {overviewLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading school data...
                </div>
              ) : overviewError ? (
                <p className="text-destructive">
                  {(overviewError as any).message}
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-4 gap-4">
                    <div className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">Teachers</p>
                      <p className="text-2xl font-bold">
                        {overview?.counts?.teachers ?? 0}
                      </p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">Students</p>
                      <p className="text-2xl font-bold">
                        {overview?.counts?.students ?? 0}
                      </p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">Paid</p>
                      <p className="text-2xl font-bold">
                        {overview?.counts?.paidStudents ?? 0}
                      </p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold flex items-center">
                        <IndianRupee className="w-5 h-5" />
                        {Number(
                          overview?.paymentsSummary?.paid ?? 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>



                  <div>
  <h3 className="font-semibold mb-3 flex items-center gap-2">
    <UserPlus className="w-5 h-5 text-primary" />
    School Admin Details
  </h3>

  <div className="overflow-x-auto rounded-lg border">
    <table className="w-full text-sm">
      <thead className="bg-muted/60">
        <tr>
          <th className="text-left p-3">Admin Name</th>
          <th className="text-left p-3">Email</th>
          <th className="text-left p-3">Phone</th>
          <th className="text-left p-3">Created At</th>
        </tr>
      </thead>
      <tbody>
        {(overview?.school_admins ?? []).length ? (
          overview.school_admins.map((admin: any) => (
            <tr key={admin.id} className="border-t">
              <td className="p-3 font-medium">{admin.full_name}</td>
              <td className="p-3">{admin.email}</td>
              <td className="p-3">{admin.phone ?? "—"}</td>
              <td className="p-3">
                {admin.created_at
                  ? new Date(admin.created_at).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={4}
              className="p-4 text-center text-muted-foreground"
            >
              No school admin created yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      Teachers in this School
                    </h3>

                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="text-left p-3">Teacher</th>
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Assigned Class</th>
                            <th className="text-left p-3">Students Added</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(overview?.teachers ?? []).length ? (
                            overview.teachers.map((t: any) => (
                              <tr key={t.id} className="border-t">
                                <td className="p-3 font-medium">
                                  {t.full_name}
                                </td>
                                <td className="p-3">{t.email}</td>
                                <td className="p-3">
                                  {t.class_assigned ?? "—"}
                                </td>
                                <td className="p-3">
                                  {t.student_count ?? 0}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="p-4 text-center text-muted-foreground"
                              >
                                No teachers added yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Students in this School
                    </h3>

                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="text-left p-3">Student</th>
                            <th className="text-left p-3">Class</th>
                            <th className="text-left p-3">Parent Phone</th>
                            <th className="text-left p-3">Teacher</th>
                            <th className="text-left p-3">Plan</th>
                            <th className="text-left p-3">Amount</th>
                            <th className="text-left p-3">Payment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(overview?.students ?? []).length ? (
                            overview.students.map((s: any) => (
                              <tr key={s.id} className="border-t">
                                <td className="p-3 font-medium">
                                  <div>{s.full_name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {s.email}
                                  </div>
                                </td>
                                <td className="p-3">
                                  {s.class_assigned ?? "—"}
                                </td>
                                <td className="p-3">
                                  {s.parent_phone ?? "—"}
                                </td>
                                <td className="p-3">
                                  {s.teacher_name ?? "—"}
                                </td>
                                <td className="p-3">
                                  {s.plan_tier ?? s.plan ?? "—"}
                                </td>
                                <td className="p-3">
                                  ₹{Number(s.amount ?? 0).toLocaleString()}
                                </td>
                                <td className="p-3">
                                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                                    {s.payment_status ?? "—"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={7}
                                className="p-4 text-center text-muted-foreground"
                              >
                                No students added yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}