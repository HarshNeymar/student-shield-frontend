import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Users, GraduationCap, CreditCard, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

export default function SchoolDashboard() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  const { data: dashboard } = useQuery({
    queryKey: ["school-dashboard", schoolId],
    enabled: !!schoolId,
    queryFn: () => api.schoolDashboard(schoolId!),
  });

  const school = dashboard?.school;
  const stats = dashboard?.stats;
  const teachers = dashboard?.teachers ?? [];
  const students = dashboard?.students ?? [];
  const payments = dashboard?.payments;
  const classCounts = dashboard?.classWiseStudentCount ?? {};
  const planCounts = dashboard?.planWiseStudentDistribution ?? {};
  const teacherStudentMap = dashboard?.teacherStudentMap ?? {};

  if (!schoolId) {
    return (
      <DashboardLayout role="school">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Your account isn't linked to a school yet. Ask the company admin.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="school">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">School Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">{school?.name ?? "Loading..."}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Teachers" value={stats?.teachers ?? 0} icon={<Users className="w-5 h-5" />} />
          <StatCard title="Students" value={stats?.students ?? 0} icon={<GraduationCap className="w-5 h-5" />} />
<Card>
  <CardContent className="p-6 flex items-center justify-between">
    <div>
      <p className="text-muted-foreground font-medium">Assigned Plan</p>
      <h3 className="text-2xl font-bold mt-2">
        {school?.selected_plan_tier ?? "Basic Plan"}
      </h3>
    </div>

    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
      <CreditCard className="w-6 h-6 text-primary" />
    </div>
  </CardContent>
</Card>
          <StatCard title="Total Claims" value={stats?.claims ?? 0} icon={<CreditCard className="w-5 h-5" />} />
        </div>


        {/* <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h2 className="font-semibold mb-3">Class-wise Student Count</h2>
            <div className="space-y-2">
              {Object.entries(classCounts).map(([klass, count]) => (
                <div key={klass} className="flex items-center justify-between text-sm"><span>{klass}</span><span className="font-semibold">{String(count)}</span></div>
              ))}
              {Object.keys(classCounts).length === 0 && <p className="text-sm text-muted-foreground">No class data yet.</p>}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h2 className="font-semibold mb-3">Plan-wise Distribution</h2>
            <div className="space-y-2">
              {Object.entries(planCounts).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between text-sm capitalize"><span>{plan}</span><span className="font-semibold">{String(count)}</span></div>
              ))}
              {Object.keys(planCounts).length === 0 && <p className="text-sm text-muted-foreground">No plan data yet.</p>}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h2 className="font-semibold mb-3">Teacher-wise Students</h2>
            <div className="space-y-2">
              {Object.entries(teacherStudentMap).map(([teacher, count]) => (
                <div key={teacher} className="flex items-center justify-between text-sm"><span>{teacher}</span><span className="font-semibold">{String(count)}</span></div>
              ))}
              {Object.keys(teacherStudentMap).length === 0 && <p className="text-sm text-muted-foreground">No mapping yet.</p>}
            </div>
          </div>
        </div> */}

        <div className="bg-card rounded-xl border border-border shadow-card">
          <div className="p-5 border-b border-border"><h2 className="font-semibold">Teachers</h2></div>
          <div className="divide-y divide-border">
            {teachers?.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center text-secondary-foreground text-sm font-bold">
                  {(t.full_name ?? t.email ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{t.full_name ?? t.email}</p>
                  <p className="text-xs text-muted-foreground">Class: {t.class_assigned ?? "—"}</p>
                </div>
              </div>
            ))}
            {teachers?.length === 0 && <p className="p-4 text-sm text-muted-foreground">No teachers yet.</p>}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h2 className="font-semibold mb-4">Payment Overview</h2>
          <div className="grid sm:grid-cols-1 gap-4">
            {/* <div className="bg-success/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Collected</p>
              <p className="text-2xl font-bold text-success">₹{(payments?.paid ?? 0).toLocaleString()}</p>
            </div> */}
            <div className="bg-warning/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-warning">₹{(payments?.pending ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
