import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const criteria = [
  { id: "behavioral", label: "Behavioral", desc: "Discipline, respect, social skills" },
  { id: "emotional", label: "Emotional", desc: "Regulation, empathy, resilience" },
  { id: "academic", label: "Academic", desc: "Learning progress, engagement" },
  { id: "participation", label: "Participation", desc: "Class activities, attendance" },
  { id: "health", label: "Health", desc: "Energy, hygiene, wellness" },
] as const;

export default function WellnessReport() {
  const { user, profile } = useAuth();
  const [studentId, setStudentId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState<Record<string, number[]>>({
    behavioral: [7], emotional: [6], academic: [8], participation: [7], health: [8],
  });

  const { data: students } = useQuery({
    queryKey: ["my-students-list", user?.id],
    enabled: !!user,
    queryFn: api.teacherWellnessStudents,
  });

  const submit = async () => {
    if (!studentId || !user || !profile?.school_id) { toast.error("Pick a student"); return; }
    setBusy(true);
    try {
      await api.submitWellnessReport({
        student_id: studentId,
        behavioral: scores.behavioral[0],
        emotional: scores.emotional[0],
        academic: scores.academic[0],
        participation: scores.participation[0],
        health: scores.health[0],
        notes,
      });
    } catch (error: any) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    setBusy(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold">Report Submitted!</h2>
            <Button className="mt-6" onClick={() => setSubmitted(false)}>Create Another</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Wellness Report</h1>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Select Student</CardTitle></CardHeader>
          <CardContent>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
              <SelectContent>
                {students?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Assessment</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {criteria.map(c => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Label className="text-sm">{c.label}</Label>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{scores[c.id][0]}/10</span>
                </div>
                <Slider value={scores[c.id]} onValueChange={(v) => setScores(p => ({ ...p, [c.id]: v }))} max={10} min={1} step={1} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Observations..." />
          </CardContent>
        </Card>

        <Button size="lg" className="w-full" onClick={submit} disabled={busy || !studentId}>
          {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Submit Report
        </Button>
      </div>
    </DashboardLayout>
  );
}
