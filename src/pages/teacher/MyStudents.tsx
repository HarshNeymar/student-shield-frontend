import { Link } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  GraduationCap,
  Loader2,
  Plus,
  Phone,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

function formatPlan(plan?: string) {
  return plan ? plan.replaceAll("_", " ") : "—";
}

function formatDate(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

export default function MyStudents() {
  const qc = useQueryClient();
  const [payingStudentId, setPayingStudentId] = useState<string | null>(null);

  const {
    data: students = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teacher-students"],
    queryFn: api.teacherStudents,
  });

  const payPendingFees = useMutation({
    mutationFn: (studentId: string) =>
      api.payTeacherStudentPendingFees(studentId),

    onMutate: (studentId: string) => {
      setPayingStudentId(studentId);
    },

    onSuccess: () => {
      toast.success("Pending fees paid successfully");
      qc.invalidateQueries({ queryKey: ["teacher-students"] });
      qc.invalidateQueries({ queryKey: ["teacher-dashboard"] });
    },

    onError: (e: any) => {
      toast.error(e.message ?? "Failed to pay pending fees");
    },

    onSettled: () => {
      setPayingStudentId(null);
    },
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              My Students
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Students enrolled by you for your assigned class.
            </p>
          </div>

          <Link to="/teacher/add-student">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </Link>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading students...
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="p-6 text-destructive">
              {(error as Error).message || "Failed to load students"}
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && students.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-muted-foreground" />
              </div>

              <h2 className="font-semibold text-lg">No students added yet</h2>

              <p className="text-sm text-muted-foreground mt-1">
                After you enroll a student, they will appear here and on your
                dashboard.
              </p>

              <Link to="/teacher/add-student" className="inline-block mt-4">
                <Button>Add First Student</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && students.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student List</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left p-4 font-medium">Student</th>
                      <th className="text-left p-4 font-medium">Class</th>
                      <th className="text-left p-4 font-medium">Plan</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Payment</th>
                      <th className="text-left p-4 font-medium">Enrolled</th>
                      <th className="text-left p-4 font-medium">
                        Pending Fees
                      </th>
                      <th className="text-left p-4 font-medium">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((row: any) => {
                      const student = row.student ?? row;
                      const studentId = student?.id;

                      const pendingPayment =
                        row.pending_payment ?? student.pending_payment ?? null;

                      const pendingAmount =
                        row.pending_amount ??
                        student.pending_amount ??
                        pendingPayment?.amount ??
                        null;

                      const pendingDueDate =
                        row.pending_due_date ??
                        student.pending_due_date ??
                        pendingPayment?.due_date ??
                        null;

                      const isThisStudentPaying =
                        payingStudentId === studentId;

                      return (
                        <tr
                          key={row.id ?? studentId}
                          className="border-b border-border last:border-0 hover:bg-muted/30"
                        >
                          <td className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                                <UserRound className="w-4 h-4 text-primary" />
                              </div>

                              <div>
                                <p className="font-medium">
                                  {student?.full_name ?? "Unnamed Student"}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  Age: {student?.age ?? "—"}
                                </p>

                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Phone className="w-3 h-3" />
                                  {student?.parent_phone ?? "No parent phone"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            {student?.class_assigned ?? "—"}
                          </td>

                          <td className="p-4">
                            <Badge variant="secondary" className="capitalize">
                              {formatPlan(row.plan_tier ?? row.plan)}
                            </Badge>
                          </td>

                          <td className="p-4">
                            ₹{Number(row.amount ?? 0).toLocaleString()}
                          </td>

                          <td className="p-4">
                            <Badge className="capitalize">
                              {formatPlan(row.payment_status)}
                            </Badge>
                          </td>

                          <td className="p-4 text-muted-foreground">
                            {formatDate(row.enrolled_at)}
                          </td>

                          <td className="p-4">
                            {pendingAmount ? (
                              <div>
                                <p className="font-medium">
                                  ₹{Number(pendingAmount).toLocaleString()}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  Due: {formatDate(pendingDueDate)}
                                </p>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="p-4">
                            {pendingPayment && studentId ? (
                              <Button
                                size="sm"
                                onClick={() =>
                                  payPendingFees.mutate(studentId)
                                }
                                disabled={isThisStudentPaying}
                              >
                                {isThisStudentPaying && (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                )}
                                {isThisStudentPaying
                                  ? "Paying..."
                                  : "Pay Pending Fees"}
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                No pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}