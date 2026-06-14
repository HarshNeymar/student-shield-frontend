import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Loader2, Building2, School, Users, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth, roleToPath, AppRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ROLES: { value: AppRole; label: string; icon: React.ElementType }[] = [
  { value: "company_admin", label: "Company Admin", icon: Building2 },
  { value: "school_admin", label: "School Admin", icon: School },
  { value: "teacher", label: "Teacher", icon: Users },
  { value: "student", label: "Student", icon: GraduationCap },
];

function RoleGrid({ value, onChange }: { value: AppRole; onChange: (r: AppRole) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ROLES.map(({ value: v, label, icon: Icon }) => {
        const active = value === v;
        return (
          <button
            type="button"
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              "flex items-center gap-2 rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all",
              active
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

const roleLabel = (r: AppRole) => ROLES.find(x => x.value === r)?.label ?? "";

export default function Login() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<AppRole>("company_admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && role) navigate(roleToPath(role), { replace: true });
    else if (!loading && user && !role) navigate("/onboarding", { replace: true });
  }, [user, role, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Signed in");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName, requested_role: selectedRole },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success(`Account created as ${roleLabel(selectedRole)}. You can sign in now.`);
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-4">
      <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground mb-2">
        <Shield className="w-8 h-8" />
        <span className="text-3xl font-bold">Student Shield</span>
      </Link>
      <p className="text-primary-foreground/70 text-sm mb-6">
        {tab === "signin" ? "Sign in to your account" : "Create your account"}
      </p>

      <div className="w-full max-w-xl bg-card rounded-2xl p-6 sm:p-8 shadow-2xl">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
          <TabsList className="grid grid-cols-1 w-full mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            {/* <TabsTrigger value="signup">Sign Up</TabsTrigger> */}
          </TabsList>

          <RoleGrid value={selectedRole} onChange={setSelectedRole} />

          <TabsContent value="signin" className="mt-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label>Username / Email</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your username"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1.5"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                  Remember me
                </label>
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Sign In as {roleLabel(selectedRole)}
              </Button>
            </form>
          </TabsContent>

          {/* <TabsContent value="signup" className="mt-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Sign Up as {roleLabel(selectedRole)}
              </Button>
            </form>
          </TabsContent> */}
        </Tabs>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">OR</span></div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
          Continue with Google
        </Button>
      </div>

      <p className="text-center text-primary-foreground/60 text-xs mt-6">
        Contact your administrator for login credentials
      </p>
    </div>
  );
}
