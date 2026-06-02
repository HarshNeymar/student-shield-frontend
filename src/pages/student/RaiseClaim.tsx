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

  const {
    data: claims,
    isLoading: claimsLoading,
    error: claimsError,
  } = useQuery({
    queryKey: ["student-my-claims"],
    queryFn: () => api.studentMyClaims(),
  });

  const activeClaim = (claims ?? []).find((claim: any) =>
    ["pending", "approved"].includes(claim.status)
  );

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    if (documents.length > 5) {
      toast.error("You can upload maximum 5 documents");
      return;
    }

    setBusy(true);

    try {
      await api.raiseStudentClaim({
        title: form.title.trim(),
        description: form.description.trim(),
        claim_reason: form.claim_reason.trim(),
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

      setDocuments([]);

      qc.invalidateQueries({ queryKey: ["student-my-claims"] });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to raise claim");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Raise Claim</h1>
          <p className="text-sm text-muted-foreground">
            Submit a protection claim request and view claims raised by you.
          </p>
        </div>

        {claimsError && (
          <Card className="border-destructive">
            <CardContent className="p-4 text-destructive">
              {(claimsError as any)?.message ?? "Unable to load claims"}
            </CardContent>
          </Card>
        )}

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
                placeholder="Example: Accident protection claim"
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
                placeholder="Example: Injury / medical support"
              />
            </div>

            <div>
              <Label>Claim Amount</Label>
              <Input
                type="number"
                value={form.amount}
                disabled={!!activeClaim}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
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
                placeholder="Enter claim details"
              />
            </div>

            <div>
              <Label>Supporting Documents</Label>
              <Input
                type="file"
                multiple
                disabled={!!activeClaim}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) =>
                  setDocuments(Array.from(e.target.files ?? []))
                }
              />

              <p className="text-xs text-muted-foreground mt-1">
                You can upload up to 5 files. PDF, image, DOC, and DOCX are
                allowed.
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

        <Card>
          <CardHeader>
            <CardTitle>Claims Raised By Me</CardTitle>
          </CardHeader>

          <CardContent>
            {claimsLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left p-3">Title</th>
                      <th className="text-left p-3">Reason</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Documents</th>
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

                          <td className="p-3">{claim.claim_reason ?? "—"}</td>

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

                          <td className="p-3">
                            {(claim.documents ?? []).length ? (
                              <div className="space-y-1">
                                {claim.documents.map((doc: any) => (
                                  <a
                                    key={doc.id}
                                    href={doc.signed_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block text-primary underline text-xs"
                                  >
                                    {doc.file_name}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-4 text-center text-muted-foreground"
                        >
                          You have not raised any claims yet.
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