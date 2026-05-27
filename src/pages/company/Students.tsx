import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function CompanyStudents() {
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["company-students"],
    queryFn: api.companyStudents,
  });

  const filtered = (data ?? []).filter((s: any) =>
    !q || (s.full_name ?? "").toLowerCase().includes(q.toLowerCase()) || (s.email ?? "").toLowerCase().includes(q.toLowerCase()) || (s.school_name ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <DashboardLayout role="company">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">All Students</h1>
          <p className="text-muted-foreground text-sm mt-1">Across all schools</p>
        </div>
        <Input placeholder="Search by name, email, or school" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" />
        <div className="bg-card rounded-xl border border-border">
          {isLoading ? <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>School</TableHead><TableHead>Class</TableHead><TableHead>Parent Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    <TableCell>{s.school_name}</TableCell>
                    <TableCell>{s.class_assigned ?? "—"}</TableCell>
                    <TableCell>{s.parent_phone ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No students found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
