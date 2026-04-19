import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function SchoolPage() {
  const { school } = useAuth();
  if (!school) {
    return (
      <AppShell>
        <Card><CardHeader><CardTitle>No school linked</CardTitle><CardDescription>Your account isn't linked to a school yet.</CardDescription></CardHeader></Card>
      </AppShell>
    );
  }
  return (
    <AppShell>
      <div className="space-y-4 max-w-3xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{school.name}</h1>
          <p className="text-sm text-muted-foreground">School profile</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Onboarding</CardTitle>
            <CardDescription>
              {school.onboarding_completed
                ? "Setup complete. All modules unlocked."
                : "Complete the wizard to unlock attendance and other modules."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={school.onboarding_completed ? "default" : "secondary"}>
              {school.onboarding_completed ? "Complete" : "Pending"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-3">
              Onboarding wizard (school details, classes, sections, subjects) is the next step we'll build.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
