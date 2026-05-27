import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AppRole, useAuth, roleToPath } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children, allow }: { children: ReactNode; allow: AppRole[] }) {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!role) return <Navigate to="/onboarding" replace />;
  if (!allow.includes(role)) return <Navigate to={roleToPath(role)} replace />;
  return <>{children}</>;
}
