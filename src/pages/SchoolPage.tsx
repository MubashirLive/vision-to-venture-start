import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
            {!school.onboarding_completed && (
              <div className="mt-3">
                <Button asChild size="sm"><Link to="/school/onboarding">Start onboarding wizard</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
