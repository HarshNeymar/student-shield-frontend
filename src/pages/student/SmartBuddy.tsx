import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Download,
  FileText,
  History,
  Loader2,
  Save,
  ExternalLink,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, SmartBuddyReport } from "@/lib/api";
import { toast } from "sonner";

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "PDF";

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SmartBuddy() {
  const [downloadingReportId, setDownloadingReportId] = useState<
    string | null
  >(null);

  const { data: profileData } = useQuery({
    queryKey: ["student-smart-buddy-profile"],
    queryFn: api.studentSmartBuddyProfile,
  });

  const {
    data: reports = [],
    isLoading: reportsLoading,
    error: reportsError,
  } = useQuery({
    queryKey: ["student-smart-buddy-reports"],
    queryFn: api.studentSmartBuddyReports,
  });

  const launchSmartBuddy = useMutation({
    mutationFn: async () => {
      const launch = await api.createStudentSmartBuddyLaunch();

      if (!launch.launch_url) {
        throw new Error(
          "Smart Buddy URL is not configured. Please contact support."
        );
      }

      return launch;
    },

    onSuccess: (launch) => {
      window.location.assign(launch.launch_url!);
    },

    onError: (error: Error) => {
      toast.error(error.message || "Unable to open Smart Buddy");
    },
  });

  const downloadReport = async (report: SmartBuddyReport) => {
    const popup = window.open("", "_blank");

    try {
      setDownloadingReportId(report.id);

      const response = await api.studentSmartBuddyReportDownload(report.id);

      if (!response.download_url) {
        throw new Error("Report download link could not be created");
      }

      if (popup) {
        popup.location.href = response.download_url;
      } else {
        window.location.assign(response.download_url);
      }
    } catch (error: any) {
      popup?.close();
      toast.error(error?.message ?? "Unable to download report");
    } finally {
      setDownloadingReportId(null);
    }
  };

  const lastSavedAt = profileData?.saved_profile?.updated_at;

  return (
    <DashboardLayout role="student">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-primary px-6 py-8 text-primary-foreground">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-7 h-7" />
                    <h1 className="text-2xl font-bold">Smart Buddy</h1>
                  </div>

                  <p className="text-sm text-primary-foreground/85 max-w-2xl">
                    Continue your learning journey, update your saved details,
                    and access your previous Smart Buddy reports.
                  </p>

                  <div className="flex items-center gap-2 text-xs text-primary-foreground/80">
                    <Save className="w-3.5 h-3.5" />
                    {lastSavedAt
                      ? `Last saved: ${formatDate(lastSavedAt)}`
                      : "Your Smart Buddy details will be saved after your first session."}
                  </div>
                </div>

                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => launchSmartBuddy.mutate()}
                  disabled={launchSmartBuddy.isPending}
                  className="min-w-52"
                >
                  {launchSmartBuddy.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Smart Buddy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              My Smart Buddy Reports
            </CardTitle>
          </CardHeader>

          <CardContent>
            {reportsLoading && (
              <div className="py-8 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading your reports...
              </div>
            )}

            {!reportsLoading && reportsError && (
              <div className="py-8 text-center text-destructive">
                {(reportsError as Error).message || "Unable to load reports"}
              </div>
            )}

            {!reportsLoading && !reportsError && reports.length === 0 && (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7 text-muted-foreground" />
                </div>

                <p className="font-medium">No Smart Buddy reports yet</p>

                <p className="text-sm text-muted-foreground mt-1">
                  Generate a report in Smart Buddy and it will appear here.
                </p>
              </div>
            )}

            {!reportsLoading && !reportsError && reports.length > 0 && (
              <div className="space-y-3">
                {reports.map((report) => {
                  const isDownloading = downloadingReportId === report.id;

                  return (
                    <div
                      key={report.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>

                        <div>
                          <p className="font-semibold">
                            {report.report_title || "Smart Buddy Report"}
                          </p>

                          <p className="text-sm text-muted-foreground mt-1">
                            Generated: {formatDate(report.generated_at)}
                          </p>

                          <p className="text-xs text-muted-foreground mt-1">
                            {report.file_name} · {formatFileSize(report.file_size)}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Preparing...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}