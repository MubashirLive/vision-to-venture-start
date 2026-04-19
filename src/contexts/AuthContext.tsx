import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "principal" | "admin" | "teacher" | "student_parent";

export interface SchoolSummary {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  onboarding_completed: boolean;
  is_active: boolean;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  school: SchoolSummary | null;
  isSuperAdmin: boolean;
  primaryRole: AppRole | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const ROLE_PRIORITY: AppRole[] = ["super_admin", "principal", "admin", "teacher", "student_parent"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [school, setSchool] = useState<SchoolSummary | null>(null);

  const loadProfileData = async (uid: string) => {
    const [{ data: roleRows }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("school_id").eq("user_id", uid).maybeSingle(),
    ]);
    const r = (roleRows ?? []).map((x: any) => x.role as AppRole);
    setRoles(r);

    if (profile?.school_id) {
      const { data: s } = await supabase
        .from("schools")
        .select("id,name,slug,logo_url,primary_color,onboarding_completed,is_active")
        .eq("id", profile.school_id)
        .maybeSingle();
      setSchool((s as SchoolSummary) ?? null);
    } else {
      setSchool(null);
    }
  };

  const refresh = async () => {
    if (user) await loadProfileData(user.id);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // defer to avoid deadlocks
        setTimeout(() => loadProfileData(sess.user.id), 0);
      } else {
        setRoles([]);
        setSchool(null);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadProfileData(session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
    setSchool(null);
  };

  const isSuperAdmin = roles.includes("super_admin");
  const primaryRole = ROLE_PRIORITY.find((r) => roles.includes(r)) ?? null;

  return (
    <AuthContext.Provider
      value={{ user, session, loading, roles, school, isSuperAdmin, primaryRole, refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
