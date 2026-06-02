import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Video, CalendarDays, PlayCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function StudentSessions() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["student-sessions"],
    queryFn: api.studentSessions,
  });

  const openRecording = async (sessionId: string) => {
    try {
      const data = await api.studentSessionRecordingUrl(sessionId);

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Recording not available");
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Sessions & Programs</h1>
          <p className="text-sm text-muted-foreground">
            View programs and recordings assigned to your school and class.
          </p>
        </div>

        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        ) : (sessions ?? []).length ? (
          <div className="grid md:grid-cols-2 gap-4">
            {(sessions ?? []).map((session: any) => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    {session.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {session.description || "No description available."}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Class</p>
                      <p className="font-semibold">
                        {session.target_class || "All Classes"}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-semibold">
                        {session.duration_minutes ?? 30} mins
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        Session Date
                      </p>
                      <p className="font-semibold">
                        {session.scheduled_at
                          ? new Date(session.scheduled_at).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!session.recording_url}
                    onClick={() => openRecording(session.id)}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {session.recording_url
                      ? "Get Program Recording"
                      : "Recording Not Available"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No sessions assigned to your school/class yet.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}