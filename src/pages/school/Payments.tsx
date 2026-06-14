import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { CreditCard, CheckCircle, Clock } from "lucide-react";

type SchoolPayment = {
  amount?: number | string;
  status?: string;
  paid_at?: string | null;
  due_date?: string | null;
  enrollment_id?: string;
  installment_no?: number | null;
};

type SchoolPaymentsResponse = {
  enrollments?: unknown[];
  enrolls?: unknown[]; // backward compatibility for older backend responses
  payments?: SchoolPayment[];
  paid?: number;
  pending?: number;
};

export default function SchoolPayments() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  const { data, isLoading, error } = useQuery<SchoolPaymentsResponse>({
    queryKey: ["school-payments-page", schoolId],
    enabled: !!schoolId,
    queryFn: () => api.schoolPayments(schoolId!),
  });

  const enrollments = data?.enrollments ?? data?.enrolls ?? [];
  const payments = data?.payments ?? [];

  return (
    <DashboardLayout role="school">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">Track collections and dues for your school</p>
        </div>

        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {(error as Error).message || "Failed to load payments."}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-4">
              <StatCard title="Enrollments" value={enrollments.length} icon={<CreditCard className="w-5 h-5" />} />
              {/* <StatCard title="Collected" value={`₹${(data?.paid ?? 0).toLocaleString()}`} icon={<CheckCircle className="w-5 h-5" />} /> */}
              <StatCard title="Pending" value={`₹${(data?.pending ?? 0).toLocaleString()}`} icon={<Clock className="w-5 h-5" />} />
            </div>

            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="p-5 border-b border-border"><h2 className="font-semibold">Recent Payments</h2></div>
              <div className="divide-y divide-border">
                {payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 text-sm">
                    <span className="text-muted-foreground">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : `Due ${p.due_date ?? "—"}`}</span>
                    <span className="font-medium">₹{Number(p.amount).toLocaleString()}</span>
                    <span className={p.status === "paid" ? "text-success" : "text-warning"}>{p.status}</span>
                  </div>
                ))}
                {payments.length === 0 && <p className="p-4 text-sm text-muted-foreground">No payments yet.</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
