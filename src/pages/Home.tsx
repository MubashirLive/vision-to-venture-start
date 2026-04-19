import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Building2, Users, ClipboardCheck, AlertCircle } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  principal: "Principal",
  admin: "Admin",
  teacher: "Teacher",
  student_parent: "Student / Parent",
};

export default function Home() {
  const { user, school, roles, isSuperAdmin, primaryRole } = useAuth();

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        <section>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Signed in as <span className="font-medium text-foreground">{user?.email}</span>
            {primaryRole && <> · <Badge variant="secondary">{ROLE_LABEL[primaryRole]}</Badge></>}
          </p>
        </section>

        {roles.length === 0 && (
          <Card className="border-warning/40 bg-warning/5">
            <CardHeader className="flex-row items-start gap-3 space-y-0">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <CardTitle className="text-base">No role assigned yet</CardTitle>
                <CardDescription>
                  Your account exists but hasn't been linked to a school yet. Ask your school's Principal or
                  the Super Admin to invite you.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        )}

        {school && !school.onboarding_completed && (primaryRole === "principal" || primaryRole === "admin") && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Finish setting up your school</CardTitle>
              <CardDescription>
                Complete onboarding to unlock attendance and other modules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/school">Continue onboarding</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isSuperAdmin && (
            <DashboardCard
              icon={ShieldCheck}
              title="Super Admin"
              desc="Manage all schools on the platform"
              to="/super-admin"
            />
          )}
          {school && (
            <DashboardCard
              icon={Building2}
              title="My School"
              desc={school.onboarding_completed ? "View & edit school details" : "Complete onboarding"}
              to="/school"
            />
          )}
          {(primaryRole === "principal" || primaryRole === "admin") && (
            <DashboardCard icon={Users} title="People" desc="Students, teachers & staff" to="/people" />
          )}
          <Card className="opacity-60">
            <CardHeader>
              <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base mt-2">Attendance</CardTitle>
              <CardDescription>Coming next — daily attendance tracking</CardDescription>
            </CardHeader>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function DashboardCard({ icon: Icon, title, desc, to }: { icon: any; title: string; desc: string; to: string }) {
  return (
    <Link to={to} className="group">
      <Card className="h-full transition-all group-hover:shadow-elegant group-hover:-translate-y-0.5">
        <CardHeader>
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle className="text-base mt-2">{title}</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
