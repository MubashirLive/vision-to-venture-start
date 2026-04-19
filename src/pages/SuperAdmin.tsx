import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Building2, Plus, Power, Loader2, Users } from "lucide-react";

interface SchoolRow {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  onboarding_completed: boolean;
  created_at: string;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);

const schoolSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(50).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  principalEmail: z.string().trim().email().max(255),
  principalName: z.string().trim().min(2).max(100),
});

export default function SuperAdmin() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", principalEmail: "", principalName: "" });

  const load = async () => {
    setLoading(true);
    const [{ data, error }, { count }] = await Promise.all([
      supabase.from("schools").select("id,name,slug,is_active,onboarding_completed,created_at").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);
    if (error) toast({ title: "Failed to load schools", description: error.message, variant: "destructive" });
    setSchools((data as SchoolRow[]) ?? []);
    setUserCount(count ?? 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schoolSchema.safeParse(form);
    if (!parsed.success) {
      return toast({ title: "Check the form", description: parsed.error.errors[0].message, variant: "destructive" });
    }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("create-school", { body: parsed.data });
    setBusy(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    if ((data as any)?.error) return toast({ title: "Failed", description: (data as any).error, variant: "destructive" });
    toast({
      title: "School created",
      description: (data as any)?.tempPassword
        ? `Principal temp password: ${(data as any).tempPassword}`
        : "Principal account is ready.",
    });
    setOpen(false);
    setForm({ name: "", slug: "", principalEmail: "", principalName: "" });
    load();
  };

  const toggleActive = async (s: SchoolRow) => {
    const { error } = await supabase.from("schools").update({ is_active: !s.is_active }).eq("id", s.id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: s.is_active ? "School deactivated" : "School activated" });
    load();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Super Admin</h1>
            <p className="text-muted-foreground text-sm">Manage schools across the SHARP platform</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> New school</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new school</DialogTitle>
                <DialogDescription>This also creates the Principal's login account.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">School name</Label>
                  <Input id="name" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug">URL slug</Label>
                  <Input id="slug" required value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
                  <p className="text-xs text-muted-foreground">Used in future for subdomains.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pname">Principal name</Label>
                  <Input id="pname" required value={form.principalName}
                    onChange={(e) => setForm({ ...form, principalName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pemail">Principal email</Label>
                  <Input id="pemail" type="email" required value={form.principalEmail}
                    onChange={(e) => setForm({ ...form, principalEmail: e.target.value })} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create school
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Building2} label="Schools" value={schools.length} />
          <StatCard icon={Power} label="Active schools" value={schools.filter((s) => s.is_active).length} />
          <StatCard icon={Users} label="Total users" value={userCount ?? "—"} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All schools</CardTitle>
            <CardDescription>Activate, deactivate, and view onboarding status.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid place-items-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : schools.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">No schools yet. Create the first one.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Onboarding</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.slug}</TableCell>
                        <TableCell>
                          {s.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                        </TableCell>
                        <TableCell>
                          {s.onboarding_completed ? <Badge variant="outline">Complete</Badge> : <Badge variant="outline">Pending</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => toggleActive(s)}>
                            {s.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-primary/40" />
        </div>
      </CardContent>
    </Card>
  );
}
