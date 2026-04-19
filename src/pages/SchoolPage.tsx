import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Pencil, Save, X, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ACADEMIC_BOARDS, INDIAN_STATES, SCHOOL_TYPES } from "@/lib/onboarding-constants";
import { z } from "zod";

const phoneRe = /^\+91[\s-]?\d{10}$/;
const profileSchema = z.object({
  name: z.string().trim().min(2, "School name required").max(120),
  acronym: z.string().trim().min(1, "Acronym required").max(10),
  address: z.string().trim().min(3, "Address required").max(255),
  city: z.string().trim().min(1, "City required").max(80),
  state: z.string().min(1, "State required"),
  contact_phone: z.string().regex(phoneRe, "Use +91XXXXXXXXXX format"),
  contact_email: z.string().email("Invalid email").max(255),
  board: z.string().min(1, "Board required"),
  school_type: z.string().min(1, "Type required"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SchoolPage() {
  const { school, primaryRole, isSuperAdmin, refresh } = useAuth();
  const canEdit = isSuperAdmin || primaryRole === "principal" || primaryRole === "admin";
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!school) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("name,acronym,address,city,state,contact_phone,contact_email,board,school_type")
        .eq("id", school.id)
        .maybeSingle();
      if (!error && data) {
        const p: ProfileForm = {
          name: data.name ?? "",
          acronym: data.acronym ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          contact_phone: data.contact_phone ?? "",
          contact_email: data.contact_email ?? "",
          board: data.board ?? "",
          school_type: data.school_type ?? "",
        };
        setProfile(p);
        setForm(p);
      }
      setLoading(false);
    })();
  }, [school?.id]);

  if (!school) {
    return (
      <AppShell>
        <Card><CardHeader><CardTitle>No school linked</CardTitle><CardDescription>Your account isn't linked to a school yet.</CardDescription></CardHeader></Card>
      </AppShell>
    );
  }

  const startEdit = () => { setForm(profile); setErrors({}); setEditing(true); };
  const cancelEdit = () => { setForm(profile); setErrors({}); setEditing(false); };

  const save = async () => {
    if (!form) return;
    const r = profileSchema.safeParse(form);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.errors.forEach((e) => { if (e.path[0]) errs[String(e.path[0])] = e.message; });
      setErrors(errs);
      toast({ title: "Please fix the errors", variant: "destructive" });
      return;
    }
    setErrors({});
    setSaving(true);
    const { error } = await supabase.from("schools").update(r.data).eq("id", school.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setProfile(r.data);
    setEditing(false);
    await refresh();
    toast({ title: "School updated" });
  };

  const set = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <AppShell>
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{profile?.name || school.name}</h1>
            <p className="text-sm text-muted-foreground">School profile</p>
          </div>
          {canEdit && profile && !editing && school.onboarding_completed && (
            <Button size="sm" variant="outline" onClick={startEdit}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          )}
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

        {school.onboarding_completed && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">School Details</CardTitle>
              <CardDescription>{editing ? "Update your school information." : "Saved school information."}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !profile || !form ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : !editing ? (
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <Info label="School Name" value={profile.name} />
                  <Info label="Acronym" value={profile.acronym} />
                  <Info label="Address" value={profile.address} className="sm:col-span-2" />
                  <Info label="City" value={profile.city} />
                  <Info label="State" value={profile.state} />
                  <Info label="Contact Number" value={profile.contact_phone} />
                  <Info label="Email" value={profile.contact_email} />
                  <Info label="Academic Board" value={profile.board} />
                  <Info label="School Type" value={profile.school_type} />
                </dl>
              ) : (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FieldEdit label="School Name *" error={errors.name}>
                      <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
                    </FieldEdit>
                    <FieldEdit label="Acronym *" error={errors.acronym}>
                      <Input value={form.acronym} maxLength={10} onChange={(e) => set("acronym", e.target.value.toUpperCase())} />
                    </FieldEdit>
                  </div>
                  <FieldEdit label="Address *" error={errors.address}>
                    <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
                  </FieldEdit>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FieldEdit label="City *" error={errors.city}>
                      <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
                    </FieldEdit>
                    <FieldEdit label="State *" error={errors.state}>
                      <Select value={form.state} onValueChange={(v) => set("state", v)}>
                        <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FieldEdit>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FieldEdit label="Contact Number *" error={errors.contact_phone}>
                      <Input value={form.contact_phone} placeholder="+91 9876543210" onChange={(e) => set("contact_phone", e.target.value)} />
                    </FieldEdit>
                    <FieldEdit label="Email *" error={errors.contact_email}>
                      <Input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
                    </FieldEdit>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FieldEdit label="Academic Board *" error={errors.board}>
                      <Select value={form.board} onValueChange={(v) => set("board", v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {ACADEMIC_BOARDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FieldEdit>
                    <FieldEdit label="School Type *" error={errors.school_type}>
                      <Select value={form.school_type} onValueChange={(v) => set("school_type", v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {SCHOOL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FieldEdit>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                    <Button onClick={save} disabled={saving}>
                      {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save</>}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function Info({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || <span className="text-muted-foreground font-normal">—</span>}</dd>
    </div>
  );
}

function FieldEdit({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className={error ? "text-destructive" : undefined}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
