import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { GraduationCap, UserPlus, Heart, ClipboardList, Phone, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const quickActions = [
  { label: "Add Student", icon: <UserPlus className="w-6 h-6" />, href: "/teacher/add-student", color: "gradient-primary" },
  { label: "Wellness Report", icon: <Heart className="w-6 h-6" />, href: "/teacher/wellness", color: "gradient-secondary" },
  { label: "Raise Claim", icon: <ClipboardList className="w-6 h-6" />, href: "/teacher/claims", color: "gradient-accent" },
  { label: "Contact Us", icon: <Phone className="w-6 h-6" />, href: "/teacher/contact", color: "bg-muted-foreground" },
];

export default function TeacherDashboard() {
  const { user, profile } = useAuth();

  const { data: dashboard } = useQuery({
    queryKey: ["teacher-dashboard", user?.id],
    enabled: !!user,
    queryFn: api.teacherDashboard,
  });

  const students = dashboard?.students ?? [];
  const counts = dashboard?.counts;

  const total = students?.length ?? 0;
  const active = dashboard?.plan?.name ?? '';

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teacher Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage only your assigned class students.</p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card min-w-[220px]">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Assigned Class</p>
            <p className="mt-1 font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              {profile?.class_assigned ?? "Not assigned"}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="My Students" value={total} icon={<GraduationCap className="w-5 h-5" />} />
          <StatCard title="Active Plan" value={active} icon={<ClipboardList className="w-5 h-5" />} />
          <StatCard title="Wellness Reports" value={counts?.reports ?? 0} icon={<Heart className="w-5 h-5" />} />
          <StatCard title="Pending Claims" value={counts?.pendingClaims ?? 0} icon={<ClipboardList className="w-5 h-5" />} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
            <Link key={i} to={a.href} className="bg-card rounded-xl p-5 border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center">
              <div className={`w-14 h-14 rounded-xl ${a.color} flex items-center justify-center text-primary-foreground mx-auto mb-3`}>
                {a.icon}
              </div>
              <p className="font-medium text-sm">{a.label}</p>
            </Link>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold">My Students</h2>
            <div className="flex gap-2"><Link to="/teacher/students"><Button size="sm" variant="outline">View All</Button></Link><Link to="/teacher/add-student"><Button size="sm">+ Add Student</Button></Link></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-3 font-medium">Student</th>
                  <th className="text-left p-3 font-medium">Class</th>
                  <th className="text-left p-3 font-medium">Plan</th>
                  <th className="text-left p-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {students?.map((s: any) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <p className="font-medium">{s.student?.full_name}</p>
                      <p className="text-xs text-muted-foreground">Parent: {s.student?.parent_phone ?? "—"}</p>
                    </td>
                    <td className="p-3 text-xs">{profile?.class_assigned ?? "—"}</td>
                    <td className="p-3"><span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">{s.plan}</span></td>
                    <td className="p-3 text-xs capitalize">{s.payment_status}</td>
                  </tr>
                ))}
                {students?.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No students enrolled yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
