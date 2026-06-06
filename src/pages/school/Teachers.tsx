import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  Users,
  Mail,
  Phone,
  BookOpen,
  Search,
} from "lucide-react";

export default function SchoolTeachers() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    class_assigned: "",
  });

  const { data: teachers, isLoading } = useQuery({
    queryKey: ["school-teachers-manage", schoolId],
    enabled: !!schoolId,
    queryFn: () => api.schoolTeachers(schoolId!),
  });

  const filteredTeachers = (teachers ?? []).filter((teacher: any) => {
    const text = [
      teacher.full_name,
      teacher.email,
      teacher.phone,
      teacher.class_assigned,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const createTeacher = useMutation({
    mutationFn: async () => api.createSchoolTeacher(form),
    onSuccess: (created: any) => {
      toast.success("Teacher created. Assigned class saved successfully.");

      if (created?.teacher && schoolId) {
        qc.setQueryData(
          ["school-teachers-manage", schoolId],
          (old: any[] | undefined) => [created.teacher, ...(old ?? [])]
        );
      }

      setForm({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        class_assigned: "",
      });

      setOpen(false);

      qc.invalidateQueries({
        queryKey: ["school-teachers-manage", schoolId],
      });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DashboardLayout role="school">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Add teachers and assign them to classes.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Add Teacher
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Teacher Login</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Password *</Label>
                  <Input
                    type="text"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Min 6 characters"
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Assign Class *</Label>
                  <Input
                    value={form.class_assigned}
                    onChange={(e) =>
                      setForm({ ...form, class_assigned: e.target.value })
                    }
                    placeholder="e.g. Class 8-A"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  An account will be created instantly. Share these credentials
                  with the teacher.
                </p>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => createTeacher.mutate()}
                  disabled={
                    !form.full_name ||
                    !form.email ||
                    form.password.length < 6 ||
                    !form.class_assigned ||
                    createTeacher.isPending
                  }
                >
                  {createTeacher.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  Create Login
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                Teacher List
              </CardTitle>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search teachers..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                Loading teachers...
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left p-3 font-semibold">#</th>
                      <th className="text-left p-3 font-semibold">
                        Teacher Name
                      </th>
                      <th className="text-left p-3 font-semibold">Email</th>
                      <th className="text-left p-3 font-semibold">Phone</th>
                      <th className="text-left p-3 font-semibold">
                        Assigned Class
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTeachers.length ? (
                      filteredTeachers.map((teacher: any, index: number) => (
                        <tr key={teacher.id ?? teacher.email} className="border-t">
                          <td className="p-3 text-muted-foreground">
                            {index + 1}
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="w-4 h-4 text-primary" />
                              </div>

                              <div>
                                <p className="font-medium text-foreground">
                                  {teacher.full_name ?? "—"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Teacher
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3">
                            {teacher.email ? (
                              <span className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                {teacher.email}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="p-3">
                            {teacher.phone ? (
                              <span className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                {teacher.phone}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="p-3">
                            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              <BookOpen className="w-3 h-3" />
                              {teacher.class_assigned ?? "—"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-6 text-center text-muted-foreground"
                        >
                          {search
                            ? "No teachers matched your search."
                            : "No teachers yet. Add your first one."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}