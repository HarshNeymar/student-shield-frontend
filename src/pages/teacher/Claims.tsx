import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, ClipboardList } from "lucide-react";

const statusColor: Record<string, string> = {
  pending: "text-warning bg-warning/15",
  approved: "text-primary bg-primary/15",
  rejected: "text-destructive bg-destructive/15",
  paid: "text-success bg-success/15",
};

export default function Claims() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", amount: "" });

  const { data: claims, isLoading } = useQuery({
    queryKey: ["my-claims"],
    queryFn: api.teacherClaims,
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user || !profile?.school_id) throw new Error("Missing school assignment");
      return api.createTeacherClaim({
        title: form.title,
        description: form.description,
        amount: Number(form.amount),
      });
    },
    onSuccess: () => {
      toast.success("Claim raised");
      setForm({ title: "", description: "", amount: "" });
      qc.invalidateQueries({ queryKey: ["my-claims"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DashboardLayout role="teacher">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Raise a Claim</h1>
          <p className="text-muted-foreground text-sm mt-1">Submit reimbursement or support claims to the company</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">New Claim</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1.5" rows={4} /></div>
            <div><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="mt-1.5" /></div>
            <Button onClick={() => create.mutate()} disabled={!form.title || !form.amount || create.isPending}>
              {create.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Submit Claim
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ClipboardList className="w-5 h-5" /> My Claims</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <div className="space-y-3">
                {claims?.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-sm">{c.title}</p>
                      <p className="text-xs text-muted-foreground">₹{Number(c.amount).toLocaleString()} · {new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[c.status] ?? ""}`}>{c.status}</span>
                  </div>
                ))}
                {claims?.length === 0 && <p className="text-sm text-muted-foreground">No claims yet.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
