import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SchoolStudents() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  const { data: students, isLoading } = useQuery({
    queryKey: ["school-students", schoolId],
    enabled: !!schoolId,
    queryFn: () => api.schoolStudents(schoolId!),
  });

  return (
    <DashboardLayout role="school">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground text-sm mt-1">All students enrolled in your school</p>
        </div>

        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students?.map((s: any) => (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="w-5 h-5 text-primary" /> {s.full_name ?? s.email}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p>Class: {s.class_assigned ?? "—"}</p>
                  {s.age != null && <p>Age: {s.age}</p>}
                  {s.parent_phone && <p>Parent: {s.parent_phone}</p>}
                </CardContent>
              </Card>
            ))}
            {students?.length === 0 && <p className="text-muted-foreground text-sm">No students yet.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
