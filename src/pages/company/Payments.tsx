import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatCard from "@/components/dashboard/StatCard";
import { CreditCard, TrendingUp, Clock, Loader2 } from "lucide-react";

export default function CompanyPayments() {
  const { data, isLoading } = useQuery({
    queryKey: ["company-payments-all"],
    queryFn: api.companyPayments,
  });

  return (
    <DashboardLayout role="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">All transactions across schools</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard title="Total Collected" value={`₹${(data?.paid ?? 0).toLocaleString()}`} icon={<TrendingUp className="w-5 h-5" />} />
          <StatCard title="Pending" value={`₹${(data?.pending ?? 0).toLocaleString()}`} icon={<Clock className="w-5 h-5" />} />
          <StatCard title="Transactions" value={data?.rows.length ?? 0} icon={<CreditCard className="w-5 h-5" />} />
        </div>
        <div className="bg-card rounded-xl border border-border">
          {isLoading ? <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>School</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Due / Paid</TableHead></TableRow></TableHeader>
              <TableBody>
                {data?.rows.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.student}</TableCell>
                    <TableCell>{r.school}</TableCell>
                    <TableCell className="capitalize">{r.plan}</TableCell>
                    <TableCell>₹{Number(r.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${r.status === "paid" ? "bg-success/10 text-success" : r.status === "pending" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.paid_at ? new Date(r.paid_at).toLocaleDateString() : r.due_date ? `Due ${new Date(r.due_date).toLocaleDateString()}` : "—"}</TableCell>
                  </TableRow>
                ))}
                {data?.rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payments yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
