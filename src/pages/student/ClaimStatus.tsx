import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function StudentClaimStatus() {
  const { data: claims, isLoading } = useQuery({
    queryKey: ["student-my-claims"],
    queryFn: api.studentMyClaims,
  });

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Claim Status</h1>
          <p className="text-sm text-muted-foreground">
            View previous claims raised by you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              My Claims
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