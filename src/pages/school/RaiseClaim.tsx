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
import { useAuth } from "@/contexts/AuthContext";

export default function SchoolRaiseClaim() {
  const qc = useQueryClient();
const [documents, setDocuments] = useState<File[]>([]);
  const [form, setForm] = useState({
    student_id: "",
    title: "",
    description: "",
    claim_reason: "",
    amount: "",
  });

  const [busy, setBusy] = useState(false);
const { profile } = useAuth();
  const schoolId = profile?.school_id;

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["school-students"],
    queryFn: () => api.schoolStudents(schoolId!),
  });

  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ["school-claims"],
    queryFn: api.schoolClaims,
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
      await api.raiseSchoolClaim({
        student_id: form.student_id,
        title: form.title,
        description: form.description,
        claim_reason: form.claim_reason,
        amount: Number(form.amount || 0),
          documents,
      });

      toast.success("Claim raised successfully");

      setForm({
        student_id: "",
        title: "",
        description: "",
        claim_reason: "",
        amount: "",
      });

      qc.invalidateQueries({ queryKey: ["school-claims"] });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to raise claim");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout role="school">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Raise Claim</h1>
          <p className="text-sm text-muted-foreground">
            Raise a claim for any student in your school.
          </p>
        </div>

        {activeClaimForSelectedStudent && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-4">
              <p className="font-semibold">
                Active claim already exists for this student
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {activeClaimForSelectedStudent.status}. No new claim can
                be raised until this claim is closed.
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
                disabled={studentsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>

                <SelectContent>
                  {(students ?? []).map((item: any) => {
                    const student = item.student ?? item;

                    return (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} — {student.class_assigned ?? "No class"}
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
                placeholder="Example: Accidental protection claim"
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
                placeholder="Example: Injury / accident / medical support"
              />
            </div>

            <div>
              <Label>Claim Amount</Label>
              <Input
                type="number"
                value={form.amount}
                disabled={!!activeClaimForSelectedStudent}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
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
                placeholder="Enter claim details"
              />
            </div>

            <div>
  <Label>Supporting Documents</Label>
  <Input
    type="file"
    multiple
    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
    onChange={(e) => setDocuments(Array.from(e.target.files ?? []))}
  />
  <p className="text-xs text-muted-foreground mt-1">
    You can upload up to 5 files. PDF, image, DOC, and DOCX are allowed.
  </p>

  {documents.length > 0 && (
    <div className="mt-2 space-y-1">
      {documents.map((file) => (
        <p key={file.name} className="text-xs text-muted-foreground">
          {file.name}
        </p>
      ))}
    </div>
  )}
</div>

            <Button
              onClick={submit}
              disabled={
                busy ||
                claimsLoading ||
                studentsLoading ||
                !!activeClaimForSelectedStudent
              }
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Submit Claim
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>School Claims</CardTitle>
          </CardHeader>

          <CardContent>
            {claimsLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left p-3">Title</th>
                      <th className="text-left p-3">Student</th>
                      <th className="text-left p-3">Raised By</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(claims ?? []).length ? (
                      claims.map((claim: any) => (
                        <tr key={claim.id} className="border-t">
                          <td className="p-3">
                            <div className="font-medium">{claim.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {claim.description}
                            </div>
                          </td>

                          <td className="p-3">
                            {claim.student_name ??
                              claim.student?.full_name ??
                              claim.student_id ??
                              "—"}
                          </td>

                          <td className="p-3">
                            {claim.raised_by_role ?? "school_admin"}
                          </td>

                          <td className="p-3">
                            ₹{Number(claim.amount ?? 0).toLocaleString()}
                          </td>

                          <td className="p-3">
                            <span className="rounded-full bg-muted px-2 py-1 text-xs">
                              {claim.status}
                            </span>
                          </td>

                          <td className="p-3">
                            {claim.created_at
                              ? new Date(claim.created_at).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-4 text-center text-muted-foreground"
                        >
                          No claims raised yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}