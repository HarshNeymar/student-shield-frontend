import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function TeacherRaiseClaim() {
  const qc = useQueryClient();

  const [form, setForm] = useState({
    student_id: "",
    title: "",
    description: "",
    claim_reason: "",
    amount: "",
  });

  const [busy, setBusy] = useState(false);

  const { data: students } = useQuery({
    queryKey: ["teacher-students"],
    queryFn: api.teacherStudents,
  });

  const { data: claims } = useQuery({
    queryKey: ["teacher-claims"],
    queryFn: api.teacherClaims,
  });

  const activeClaimForSelectedStudent = (claims ?? []).find(
    (claim: any) =>
      claim.student_id === form.student_id &&
      ["pending", "approved"].includes(claim.status)
  );

  const submit = async () => {
    if (!form.student_id || !form.title || !form.description) {
      toast.error("Student, title and description are required");
      return;
    }

    setBusy(true);

    try {
      await api.raiseTeacherClaim({
        student_id: form.student_id,
        title: form.title,
        description: form.description,
        claim_reason: form.claim_reason,
        amount: Number(form.amount || 0),
      });

      toast.success("Claim raised successfully");
      setForm({
        student_id: "",
        title: "",
        description: "",
        claim_reason: "",
        amount: "",
      });

      qc.invalidateQueries({ queryKey: ["teacher-claims"] });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to raise claim");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Raise Claim</h1>
          <p className="text-sm text-muted-foreground">
            Raise a claim for one of your assigned students.
          </p>
        </div>

        {activeClaimForSelectedStudent && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-4">
              <p className="font-semibold">
                Active claim already exists for this student
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {activeClaimForSelectedStudent.status}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Claim Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label>Student *</Label>
              <Select
                value={form.student_id}
                onValueChange={(v) => setForm({ ...form, student_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {(students ?? []).map((item: any) => {
                    const student = item.student ?? item;

                    return (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} — {student.class_assigned}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Claim Title *</Label>
              <Input
                value={form.title}
                disabled={!!activeClaimForSelectedStudent}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Reason</Label>
              <Input
                value={form.claim_reason}
                disabled={!!activeClaimForSelectedStudent}
                onChange={(e) =>
                  setForm({ ...form, claim_reason: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Claim Amount</Label>
              <Input
                type="number"
                value={form.amount}
                disabled={!!activeClaimForSelectedStudent}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                disabled={!!activeClaimForSelectedStudent}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <Button
              onClick={submit}
              disabled={busy || !!activeClaimForSelectedStudent}
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Submit Claim
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}