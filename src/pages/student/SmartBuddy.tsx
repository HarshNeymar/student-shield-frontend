import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, PlayCircle, RotateCcw, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function SmartBuddy() {
  const startBuddy = () => {
    toast.success("Smart Buddy mentorship module will open here.");
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Meet Your Smart Buddy</h1>
          <p className="text-sm text-muted-foreground">
            Your mentorship and guided support space.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              Smart Buddy Mentorship
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-xl border bg-primary/5 p-6">
              <h2 className="text-xl font-semibold">
                Welcome to your Smart Buddy journey
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                This area will integrate your already developed mentorship
                program. You can connect the existing Smart Buddy module here.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Button className="h-24 flex-col gap-2" onClick={startBuddy}>
                <PlayCircle className="w-6 h-6" />
                Start Smart Buddy
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={startBuddy}
              >
                <RotateCcw className="w-6 h-6" />
                Continue Session
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={startBuddy}
              >
                <TrendingUp className="w-6 h-6" />
                View Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}