import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const planDetails: Record<string, any> = {
  basic: {
    name: "Basic Plan",
    amount: 399,
    description: "Basic yearly Student Shield protection",
  },
  standard: {
    name: "Standard Plan",
    amount: 799,
    description: "Standard yearly Student Shield protection",
  },
  premium: {
    name: "Premium Plan",
    amount: 1199,
    description: "Premium yearly Student Shield protection",
  },
};

export default function SchoolPaymentPlans() {
  const { data, isLoading } = useQuery({
    queryKey: ["school-assigned-plan"],
    queryFn: api.schoolAssignedPlan,
  });

  const selectedPlan = data?.selected_plan_tier ?? "basic";
  const plan = planDetails[selectedPlan] ?? planDetails.basic;

  return (
    <DashboardLayout role="school">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Assigned Payment Plan</h1>
          <p className="text-sm text-muted-foreground">
            This plan is assigned by Company Admin and will be used by teachers
            while enrolling students.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Current School Plan
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="rounded-xl border bg-primary/5 p-5">
                <p className="text-sm text-muted-foreground">
                  {data?.school_name}
                </p>

                <h2 className="text-2xl font-bold mt-1">{plan.name}</h2>

                <p className="text-xl font-semibold mt-2">
                  ₹{plan.amount} yearly
                </p>

                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>

                <p className="text-xs text-muted-foreground mt-4">
                  Only Company Admin can change this plan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}