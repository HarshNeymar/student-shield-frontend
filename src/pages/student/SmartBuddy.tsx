import { useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const SMART_BUDDY_URL =
  import.meta.env.VITE_SMART_BUDDY_URL ||
  "https://YOUR_DEPLOYED_SMART_BUDDY_URL_HERE";

export default function SmartBuddy() {
  const { data, isLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: api.studentDashboard,
  });

  useEffect(() => {
    if (!data) return;

    const params = new URLSearchParams({
      autoLogin: "true",
      studentId: data?.profile?.id ?? "",
      studentName: data?.profile?.full_name ?? "",
      schoolName: data?.school?.name ?? "",
      className: data?.profile?.class_assigned ?? "",
      age: data?.profile?.age ? String(data.profile.age) : "",
      phone: data?.profile?.parent_phone ?? data?.profile?.id ?? "",
    });

    window.location.href = `${SMART_BUDDY_URL}?${params.toString()}`;
  }, [data]);

  return (
    <DashboardLayout role="student">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Bot className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-xl font-bold">Opening Smart Buddy</h1>

            <p className="text-sm text-muted-foreground">
              Please wait while we open your Smart Buddy mentor.
            </p>

            {(isLoading || !data) && (
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}