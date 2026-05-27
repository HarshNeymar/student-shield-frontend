import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle, Loader2, Mail, Phone } from "lucide-react";

export default function ContactUs() {
  const [form, setForm] = useState({ subject: "", priority: "normal", message: "" });
  const [busy, setBusy] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any | null>(null);

  const submit = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Please enter subject and message");
      return;
    }

    setBusy(true);
    try {
      const data = await api.submitTeacherContact(form);
      setSubmittedTicket(data.ticket ?? data);
      setForm({ subject: "", priority: "normal", message: "" });
      toast.success(data.message ?? "Message submitted successfully");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to submit message");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contact Us</h1>
          <p className="text-sm text-muted-foreground mt-1">Send a support request to the Student Shield team.</p>
        </div>

        {submittedTicket && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-5 flex gap-3">
              <CheckCircle className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-semibold">Message submitted</p>
                <p className="text-sm text-muted-foreground">Ticket created successfully. Status: {submittedTicket.status ?? "pending"}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Support Message</CardTitle>
            <CardDescription>Use this form for technical issues, enrollment questions, payment support, or program help.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Subject *</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Unable to view student report"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Message *</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write your message here..."
                className="mt-1.5 min-h-[160px]"
              />
            </div>

            <Button onClick={submit} disabled={busy} className="w-full sm:w-auto">
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Message
            </Button>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 flex gap-3 items-center">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">Available during business hours</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex gap-3 items-center">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">We will respond as soon as possible</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
