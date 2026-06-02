import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function StudentWellnessReports() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["student-wellness-reports"],
    queryFn: api.studentWellnessReports,
  });

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Wellness Reports</h1>
          <p className="text-sm text-muted-foreground">
            Latest and past wellness reports created by your teacher.
          </p>
        </div>

        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        ) : (reports ?? []).length ? (
          <div className="space-y-4">
            {(reports ?? []).map((report: any, index: number) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {index === 0 ? "Latest Wellness Report" : "Past Report"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created By</p>
                      <p className="font-semibold">
                        {report.teacher_name ?? "Teacher"}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-semibold">
                        {report.created_at
                          ? new Date(report.created_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Report ID</p>
                      <p className="font-mono text-xs">{report.id}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <ReportField label="Behavioral" value={report.behavioral} />
                    <ReportField label="Emotional" value={report.emotional} />
                    <ReportField label="Academic" value={report.academic} />
                    <ReportField
                      label="Participation"
                      value={report.participation}
                    />
                    <ReportField label="Health" value={report.health} />
                    <ReportField label="Notes" value={report.notes} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No wellness reports available yet.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function ReportField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium mt-1">{value || "—"}</p>
    </div>
  );
}