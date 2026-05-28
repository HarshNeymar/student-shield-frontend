import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function StudentRaiseClaim() {
  const qc = useQueryClient();
const [documents, setDocuments] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    claim_reason: "",
    amount: "",
  });

  const [busy, setBusy] = useState(false);

  const { data: claims } = useQuery({
    queryKey: ["student-claims"],
    queryFn: api.studentClaims,
  });

  const activeClaim = (claims ?? []).find((claim: any) =>
    ["pending", "approved"].includes(claim.status)
  );

  const submit = async () => {
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }

    setBusy(true);

    try {
      await api.raiseStudentClaim({
  title: form.title,
  description: form.description,
  claim_reason: form.claim_reason,
  amount: Number(form.amount || 0),
  documents,
});

      toast.success("Claim raised successfully");
      setForm({
        title: "",
        description: "",
        claim_reason: "",
        amount: "",
      });

      qc.invalidateQueries({ queryKey: ["student-claims"] });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to raise claim");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Raise Claim</h1>
          <p className="text-sm text-muted-foreground">
            Submit a protection claim request.
          </p>
        </div>

        {activeClaim && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-4">
              <p className="font-semibold">Active claim already exists</p>
              <p className="text-sm text-muted-foreground">
                Status: {activeClaim.status}. No new claim can be raised until
                this claim is closed.
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
              <Label>Claim Title *</Label>
              <Input
                value={form.title}
                disabled={!!activeClaim}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Reason</Label>
              <Input
                value={form.claim_reason}
                disabled={!!activeClaim}
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
                disabled={!!activeClaim}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                disabled={!!activeClaim}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
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

            <Button onClick={submit} disabled={busy || !!activeClaim}>
              {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Submit Claim
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}