import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";

export type AppRole = "company_admin" | "school_admin" | "teacher" | "student";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  school_id: string | null;
  class_assigned: string | null;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const roleToPath = (r: AppRole | null) => {
  switch (r) {
    case "company_admin": return "/company";
    case "school_admin": return "/school";
    case "teacher": return "/teacher";
    case "student": return "/student";
    default: return "/login";
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (_uid: string) => {
    try {
      const { profile: prof, role: found } = await api.me();
      setProfile(prof as Profile | null);
      setRole(found as AppRole | null);
    } catch {
      setProfile(null);
      setRole(null);
    }
  };

  const refresh = async () => {
    if (user) await loadUserData(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setLoading(true);
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => loadUserData(sess.user.id).finally(() => setLoading(false)), 0);
      } else {
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      if (sess) {
        const { data: userData, error } = await supabase.auth.getUser();
        if (error || !userData.user) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
          setLoading(false);
          return;
        }
      }
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) loadUserData(sess.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <Ctx.Provider value={{ user, session, profile, role, loading, signOut, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
