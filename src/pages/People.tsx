import { AppShell } from "@/components/AppShell";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function People() {
  return (
    <AppShell>
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold">People</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coming next</CardTitle>
            <CardDescription>
              Students, teachers and staff management — one-by-one and bulk Excel/CSV upload.
              We'll build this after onboarding.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AppShell>
  );
}
