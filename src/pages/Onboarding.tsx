import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth, roleToPath } from "@/contexts/AuthContext";
import { toast } from "sonner";

// First-run helper: lets the very first signed-in user claim Company Admin
// (only works if NO company_admin exists yet). After that, admins assign roles.
export default function Onboarding() {
  const { user, role, loading, refresh, signOut } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [canBootstrap, setCanBootstrap] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (role) { navigate(roleToPath(role), { replace: true }); return; }
    (async () => {
      const result = await api.companyAdminExists();
      setCanBootstrap(!result.exists);
      setChecking(false);
    })();
  }, [user, role, loading, navigate]);

  const claimAdmin = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await api.claimCompanyAdmin();
    } catch (error: any) {
      setBusy(false);
      if (error.message.toLowerCase().includes("session")) {
        await signOut();
        navigate("/login", { replace: true });
      }
      toast.error(error.message);
      return;
    }
    setBusy(false);
    toast.success("You are now Company Admin");
    await refresh();
    navigate("/company");
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground mb-2">
            <Shield className="w-7 h-7" />
          </div>
          <CardTitle>Welcome, {user?.email}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {canBootstrap ? (
            <>
              <p className="text-sm text-muted-foreground">
                No Company Admin exists yet. Claim ownership of this workspace.
              </p>
              <Button className="w-full" size="lg" onClick={claimAdmin} disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Become Company Admin
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Your account isn't assigned a role yet. Please contact your school admin or company admin to be added.
              </p>
              <Button variant="outline" className="w-full" onClick={() => { signOut(); navigate("/login"); }}>
                Sign out
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
