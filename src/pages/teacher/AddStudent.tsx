import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, MessageCircle, ReceiptText } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const planPrices: Record<string, number> = {
  basic: 400,
  standard: 800,
  premium: 1200,
};

const planLabels: Record<string, string> = {
  basic: "Basic Plan",
  standard: "Standard Plan",
  premium: "Premium Plan",
};

export default function AddStudent() {
  const { profile } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    parent_phone: "",
    age: "",
    class_assigned: "",
    username: "",
    password: "",
    plan: "",
    payment_type: "", // one_time / installment
    payment_mode: "online", // DB enum: cash/card/upi/bank_transfer/cheque/online
    install1: "",
    install2: "",
  });

  const [busy, setBusy] = useState(false);
  const [enrolled, setEnrolled] = useState<any | null>(null);

  useEffect(() => {
    if (profile?.class_assigned) {
      setForm((prev) => ({
        ...prev,
        class_assigned: profile.class_assigned ?? "",
      }));
    }
  }, [profile?.class_assigned]);

  const amount = form.plan ? planPrices[form.plan] : 0;

const paidAmount = form.payment_type === "installment" ? amount / 2 : amount;
const remainingAmount = form.payment_type === "installment" ? amount / 2 : 0;
  const submit = async () => {
    if (
      !form.full_name ||
      !form.parent_phone ||
      !form.username ||
      !form.password ||
      !form.plan ||
      !form.payment_type ||
      !form.payment_mode ||
      !form.class_assigned
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (form.payment_type === "installment" && (!form.install1 || !form.install2)) {
      toast.error("Please select both installment dates");
      return;
    }

    setBusy(true);

    try {
const data = await api.createStudent({
  full_name: form.full_name,
  username: form.username,
  password: form.password,
  age: form.age ? Number(form.age) : undefined,
  parent_phone: form.parent_phone,
  class_assigned: form.class_assigned,

  // Student Shield plan tier
  plan_tier: form.plan,

  // Keep old field also for backend compatibility
  plan: form.plan,

  amount,

  // DB payment method enum
  payment_mode: form.payment_mode,

  // Student Shield payment flow
  payment_type: form.payment_type,

  paid_amount: paidAmount,
  remaining_amount: remainingAmount,
  installment_dates:
    form.payment_type === "installment" ? [form.install1, form.install2] : [],
});
      setEnrolled(data);
      toast.success("Student enrolled and WhatsApp notification prepared");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to enroll student");
    } finally {
      setBusy(false);
    }
  };

  if (enrolled) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-8 text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Student Enrolled Successfully
                </h2>
                <p className="text-muted-foreground mt-2">
                  Login email:{" "}
                  <span className="font-mono">
                    {enrolled.email ?? enrolled.student?.email}
                  </span>
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-left">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ReceiptText className="w-3 h-3" /> Receipt
                  </p>
                  <p className="font-semibold">
                    {enrolled.receipt?.receipt_no ?? "Generated"}
                  </p>
                  <p className="text-sm">
                    Paid ₹
                    {Number(
                      enrolled.receipt?.paid_amount ?? paidAmount ?? 0
                    ).toLocaleString()}{" "}
                    / Remaining ₹
                    {Number(
                      enrolled.receipt?.remaining_amount ?? remainingAmount ?? 0
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </p>
                  <p className="font-semibold">
                    {enrolled.whatsapp?.status ?? "prepared"}
                  </p>
                  <p className="text-sm">
                    Message includes receipt, app link and login details.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/teacher/students">
                  <Button variant="outline">View My Students</Button>
                </Link>

                <Button
                  onClick={() => {
                    setEnrolled(null);
                    setForm((prev) => ({
                      ...prev,
                      full_name: "",
                      username: "",
                      password: "",
                      parent_phone: "",
                      age: "",
                      plan: "",
                      payment_type: "",
                      payment_mode: "online",
                      install1: "",
                      install2: "",
                    }));
                  }}
                >
                  Enroll Another Student
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Add New Student</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enroll a student, collect payment details, create login and send
            parent confirmation.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Student Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Student Name *</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Parent Contact Number *</Label>
                <Input
                  value={form.parent_phone}
                  onChange={(e) =>
                    setForm({ ...form, parent_phone: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Assigned Class *</Label>
                <Input
                  value={form.class_assigned}
                  readOnly={!!profile?.class_assigned}
                  onChange={(e) =>
                    setForm({ ...form, class_assigned: e.target.value })
                  }
                  className="mt-1.5"
                  placeholder="e.g. 1st - 2nd"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plan & Payment</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label>Plan *</Label>
              <Select
                value={form.plan}
                onValueChange={(v) => setForm({ ...form, plan: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    Basic Plan — ₹400 yearly
                  </SelectItem>
                  <SelectItem value="standard">
                    Standard Plan — ₹800 yearly
                  </SelectItem>
                  <SelectItem value="premium">
                    Premium Plan — ₹1,200 yearly
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.plan && (
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Amount to be Taken
                </p>
                <p className="text-2xl font-bold text-primary">
                  ₹{amount.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / year
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {planLabels[form.plan]}
                </p>
              </div>
            )}

            <div>
              <Label>Payment Type *</Label>
              <Select
                value={form.payment_type}
                onValueChange={(v) => setForm({ ...form, payment_type: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One-Time Payment</SelectItem>
                  <SelectItem value="installment">
                    Installment Payment
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payment Mode *</Label>
              <Select
                value={form.payment_mode}
                onValueChange={(v) => setForm({ ...form, payment_mode: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.payment_type === "installment" && (
              <div className="grid sm:grid-cols-2 gap-4 bg-muted/50 rounded-lg p-4">
                <div>
                  <Label>First Installment Date</Label>
                  <Input
                    type="date"
                    value={form.install1}
                    onChange={(e) =>
                      setForm({ ...form, install1: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Second Installment Date</Label>
                  <Input
                    type="date"
                    value={form.install2}
                    onChange={(e) =>
                      setForm({ ...form, install2: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>

                <p className="sm:col-span-2 text-sm text-muted-foreground">
                  Installment amount:{" "}
                  <span className="font-semibold">
                    ₹{(amount / 2).toLocaleString()}
                  </span>{" "}
                  each
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Student Login Credentials
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Student Username *</Label>
                <Input
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="e.g. student@email.com"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Student Password *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  minLength={6}
                  className="mt-1.5"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              These login details are sent to the parent with the app download
              link and receipt.
            </p>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full" onClick={submit} disabled={busy}>
          {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Enroll Student
        </Button>
      </div>
    </DashboardLayout>
  );
}