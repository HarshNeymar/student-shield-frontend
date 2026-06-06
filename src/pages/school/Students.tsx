import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Loader2,
  GraduationCap,
  Search,
  Phone,
  Mail,
  BookOpen,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SchoolStudents() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  const [search, setSearch] = useState("");

  const { data: students, isLoading } = useQuery({
    queryKey: ["school-students", schoolId],
    enabled: !!schoolId,
    queryFn: () => api.schoolStudents(schoolId!),
  });

  const filteredStudents = (students ?? []).filter((student: any) => {
    const text = [
      student.full_name,
      student.email,
      student.class_assigned,
      student.parent_phone,
      student.age,
      student.teacher_name,
      student.payment_status,
      student.plan,
      student.plan_tier,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <DashboardLayout role="school">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All students enrolled in your school.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="w-5 h-5 text-primary" />
                Student List
              </CardTitle>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                Loading students...
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left p-3 font-semibold">#</th>
                      <th className="text-left p-3 font-semibold">
                        Student Name
                      </th>
                      <th className="text-left p-3 font-semibold">Email</th>
                      <th className="text-left p-3 font-semibold">Class</th>
                      <th className="text-left p-3 font-semibold">Age</th>
                      <th className="text-left p-3 font-semibold">
                        Parent Phone
                      </th>
                      <th className="text-left p-3 font-semibold">Teacher</th>
                      <th className="text-left p-3 font-semibold">Plan</th>
                      <th className="text-left p-3 font-semibold">
                        Payment Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.length ? (
                      filteredStudents.map((student: any, index: number) => (
                        <tr
                          key={student.id ?? student.email}
                          className="border-t"
                        >
                          <td className="p-3 text-muted-foreground">
                            {index + 1}
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>

                              <div>
                                <p className="font-medium text-foreground">
                                  {student.full_name ?? "—"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Student
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3">
                            {student.email ? (
                              <span className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                {student.email}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="p-3">
                            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              <BookOpen className="w-3 h-3" />
                              {student.class_assigned ?? "—"}
                            </span>
                          </td>

                          <td className="p-3">{student.age ?? "—"}</td>

                          <td className="p-3">
                            {student.parent_phone ? (
                              <span className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                {student.parent_phone}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="p-3">
                            {student.teacher_name ?? "—"}
                          </td>

                          <td className="p-3">
                            {student.plan_tier ?? student.plan ?? "—"}
                          </td>

                          <td className="p-3">
                            <span className="rounded-full bg-muted px-2 py-1 text-xs">
                              {student.payment_status ?? "—"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="p-6 text-center text-muted-foreground"
                        >
                          {search
                            ? "No students matched your search."
                            : "No students yet."}
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