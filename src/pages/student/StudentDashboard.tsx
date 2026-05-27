import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, Heart, BookOpen, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function StudentDashboard() {
  const { user, profile } = useAuth();

  const { data: dashboard } = useQuery({
    queryKey: ["student-dashboard", user?.id],
    enabled: !!user,
    queryFn: api.studentDashboard,
  });

  const enrollment = dashboard?.enrollment;
  const reports = dashboard?.reports ?? [];
  const sessions = dashboard?.sessions ?? [];

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="gradient-primary rounded-2xl p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold">Welcome, {profile?.full_name?.split(" ")[0] ?? "Student"}! 👋</h1>
          <p className="text-primary-foreground/80 mt-1">
            {enrollment ? `Active plan: ${enrollment.plan.toUpperCase()}` : "No active enrollment yet."}
          </p>
        </div>

        {enrollment && (
          <div className="grid sm:grid-cols-3 gap-4">
            {benefits.map((b, i) => (
              <Card key={i} className="border-success/20">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center text-success">{b.icon}</div>
                  <div>
                    <p className="font-medium text-sm">{b.name}</p>
                    <p className="text-xs text-success font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Activated</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5 text-destructive" /> Wellness Reports</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports?.map((r: any) => {
                const overall = ((r.behavioral + r.emotional + r.academic + r.participation + r.health) / 5).toFixed(1);
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{new Date(r.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">By: {r.teacher?.full_name ?? "Teacher"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{overall}</p>
                      <p className="text-xs text-muted-foreground">Overall</p>
                    </div>
                  </div>
                );
              })}
              {reports?.length === 0 && <p className="text-sm text-muted-foreground">No wellness reports yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Sessions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions?.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.scheduled_at).toLocaleString()}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">{s.status}</span>
                </div>
              ))}
              {sessions?.length === 0 && <p className="text-sm text-muted-foreground">No sessions scheduled.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
