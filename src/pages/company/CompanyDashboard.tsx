import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { School, GraduationCap, CreditCard, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function CompanyDashboard() {
  const { data: dashboard } = useQuery({
    queryKey: ["company-dashboard"],
    queryFn: api.companyDashboard,
  });

  const stats = dashboard?.stats;
  const recent = dashboard?.recent ?? [];
  const schools = dashboard?.schools ?? [];
  const planDist = dashboard?.planDist;

  return (
    <DashboardLayout role="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of all schools and students</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Schools" value={stats?.schools ?? 0} icon={<School className="w-5 h-5" />} />
          <StatCard title="Total Students" value={stats?.students ?? 0} icon={<GraduationCap className="w-5 h-5" />} />
          {/* <StatCard title="Active Plans" value={stats?.active ?? 0} icon={<CreditCard className="w-5 h-5" />} /> */}
          <StatCard title="Total Revenue" value={`₹${(stats?.revenue ?? 0).toLocaleString()}`} icon={<TrendingUp className="w-5 h-5" />} />
           <StatCard title="Total Claims" value={stats?.claims ?? 0} icon={<CreditCard className="w-5 h-5" />} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-semibold text-card-foreground">Recent Enrollments</h2>
            </div>
            <div className="divide-y divide-border">
              {recent?.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm text-card-foreground">{e.student?.full_name ?? "Student"}</p>
                    <p className="text-xs text-muted-foreground">{e.school?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">{e.plan}</span>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(e.enrolled_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {recent?.length === 0 && <p className="p-4 text-sm text-muted-foreground">No enrollments yet.</p>}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-semibold text-card-foreground">Schools</h2>
              <Link to="/company/schools"><Button variant="ghost" size="sm" className="text-primary">Manage</Button></Link>
            </div>
            <div className="divide-y divide-border">
              {schools?.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground">
                    <School className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-sm text-card-foreground">{s.name}</p>
                </div>
              ))}
              {schools?.length === 0 && <p className="p-4 text-sm text-muted-foreground">No schools yet. <Link to="/company/schools" className="text-primary underline">Add one</Link>.</p>}
            </div>
          </div>
        </div>

        {planDist && (
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h2 className="font-semibold text-card-foreground mb-4">Plan Distribution</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {(["basic", "standard", "premium"] as const).map((p) => {
                const count = planDist[p];
                const pct = Math.round((count / planDist.total) * 100);
                return (
                  <div key={p} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{p}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
