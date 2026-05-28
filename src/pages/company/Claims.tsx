import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldAlert } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function CompanyClaims() {
  const qc = useQueryClient();

  const { data: claims, isLoading } = useQuery({
    queryKey: ["company-claims"],
    queryFn: api.companyClaims,
  });

  const updateStatus = useMutation({
    mutationFn: ({ claimId, status }: { claimId: string; status: string }) =>
      api.updateCompanyClaimStatus(claimId, status),
    onSuccess: () => {
      toast.success("Claim status updated");
      qc.invalidateQueries({ queryKey: ["company-claims"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DashboardLayout role="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Claims</h1>
          <p className="text-muted-foreground text-sm">
            View and manage claims raised by students, teachers, and school admins.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Claim Requests
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left p-3">Student</th>
                      <th className="text-left p-3">School</th>
                      <th className="text-left p-3">Raised By</th>
                      <th className="text-left p-3">Title</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Documents</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(claims ?? []).length ? (
                      claims.map((claim: any) => (
                        <tr key={claim.id} className="border-t align-top">
                          <td className="p-3">
                            <div className="font-medium">
                              {claim.student?.full_name ?? "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {claim.student?.class_assigned ?? ""}
                            </div>
                          </td>

                          <td className="p-3">
                            {claim.school?.name ?? "—"}
                          </td>

                          <td className="p-3">
                            <div>{claim.raised_by?.full_name ?? "—"}</div>
                            <div className="text-xs text-muted-foreground">
                              {claim.raised_by_role}
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="font-medium">{claim.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {claim.description}
                            </div>
                          </td>

                          <td className="p-3">
                            ₹{Number(claim.amount ?? 0).toLocaleString()}
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

                          <td className="p-3">
                            <span className="rounded-full bg-muted px-2 py-1 text-xs">
                              {claim.status}
                            </span>
                          </td>


                          <td className="p-3 min-w-[180px]">
                            <Select
                              value={claim.status}
                              onValueChange={(status) =>
                                updateStatus.mutate({
                                  claimId: claim.id,
                                  status,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-4 text-center text-muted-foreground"
                        >
                          No claims found.
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