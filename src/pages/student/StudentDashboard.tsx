import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  PiggyBank,
  HeartPulse,
  Bot,
  FileText,
  Video,
  Loader2,
  School,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function StudentDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: api.studentDashboard,
  });

  if (isLoading) {
    return (
      <DashboardLayout role="student">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </DashboardLayout>
    );
  }

  const studentName = data?.profile?.full_name ?? "Student";

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {studentName} to the Student Shield Program.
          </h1>
          <p className="text-muted-foreground mt-1">
            {data?.school?.name ?? "Your School"} · Class{" "}
            {data?.profile?.class_assigned ?? "—"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Accidental Protection</p>
                <p className="text-sm text-green-600">Activated</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Future Financial Security</p>
                <p className="text-sm text-green-600">Activated</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Student Protection</p>
                <p className="text-sm text-green-600">Activated</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              Enrollment Details
            </CardTitle>
          </CardHeader>

          <CardContent className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="font-semibold">{data?.plan?.name ?? "—"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <p className="font-semibold">
                {data?.enrollment?.payment_status ?? "—"}  ({data?.pendingInstallment?.due_date ?? "—"})
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Teacher</p>
              <p className="font-semibold">{data?.teacher?.full_name ?? "—"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Benefit Until</p>
              <p className="font-semibold">
                {data?.enrollment?.expires_at
                  ? new Date(data.enrollment.expires_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Meet Your Smart Buddy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Continue your mentorship journey.
              </p>
              <Link to="/student/smart-buddy">
                <Button className="w-full">Start Smart Buddy</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Wellness Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {data?.counts?.wellnessReports ?? 0} reports available.
              </p>
              <Link to="/student/wellness-reports">
                <Button variant="outline" className="w-full">
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Sessions & Programs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                View recent programs and recordings.
              </p>
              <Link to="/student/sessions">
                <Button variant="outline" className="w-full">
                  View Sessions
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}