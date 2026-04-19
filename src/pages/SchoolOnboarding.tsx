import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SchoolStep } from "@/components/onboarding/SchoolStep";
import { SessionStep } from "@/components/onboarding/SessionStep";
import { SubjectsStep } from "@/components/onboarding/SubjectsStep";
import { SummaryStep } from "@/components/onboarding/SummaryStep";
import type { WizardData } from "@/components/onboarding/types";

const STEPS = ["School", "Session & Classes", "Subjects", "Review"];

const phoneRe = /^\+91[\s-]?\d{10}$/;

const schoolSchema = z.object({
  name: z.string().trim().min(2, "School name required").max(120),
  acronym: z.string().trim().min(1, "Acronym required").max(10),
  address: z.string().trim().min(3, "Address required").max(255),
  city: z.string().trim().min(1, "City required").max(80),
  state: z.string().min(1, "State required"),
  contact_phone: z.string().regex(phoneRe, "Use +91XXXXXXXXXX format"),
  contact_email: z.string().email("Invalid email").max(255),
  board: z.string().min(1, "Board required"),
  school_type: z.string().min(1, "Type required"),
  shifts: z.array(z.object({ name: z.string().min(1), start_time: z.string(), end_time: z.string() })).min(1),
});

const sessionSchema = z.object({
  academic_year: z.string().min(1, "Year required"),
  start_date: z.string().min(1, "Start date required"),
  end_date: z.string().min(1, "End date required"),
  term_structure: z.string().min(1, "Term structure required"),
  classes: z.array(z.any()).min(1, "Add at least one class"),
});

export default function SchoolOnboarding() {
  const { school, refresh } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<WizardData>({
    school: {
      name: school?.name ?? "",
      acronym: "",
      address: "",
      city: "",
      state: "",
      contact_phone: "+91",
      contact_email: "",
      board: "",
      school_type: "",
      shifts: [{ name: "Morning", start_time: "08:00", end_time: "14:00" }],
    },
    session: {
      academic_year: "2025-26",
      start_date: "",
      end_date: "",
      term_structure: "",
      classes: [],
    },
  });

  if (!school) {
    return <AppShell><Card><CardHeader><CardTitle>No school linked</CardTitle></CardHeader></Card></AppShell>;
  }

  const validateStep = (): boolean => {
    if (step === 0) {
      const r = schoolSchema.safeParse(data.school);
      if (!r.success) { toast({ title: "Fix errors", description: r.error.errors[0].message, variant: "destructive" }); return false; }
    }
    if (step === 1) {
      const r = sessionSchema.safeParse(data.session);
      if (!r.success) { toast({ title: "Fix errors", description: r.error.errors[0].message, variant: "destructive" }); return false; }
      if (data.session.start_date >= data.session.end_date) {
        toast({ title: "Invalid dates", description: "End date must be after start date", variant: "destructive" });
        return false;
      }
    }
    if (step === 2) {
      const empty = data.session.classes.find((c) => c.subjects.length === 0);
      if (empty) {
        toast({ title: "Add subjects", description: `${empty.name} has no subjects yet`, variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setSubmitting(true);
    try {
      const s = data.school;
      // 1) Update school
      const { error: schErr } = await supabase.from("schools").update({
        name: s.name, acronym: s.acronym, address: s.address, city: s.city, state: s.state,
        contact_phone: s.contact_phone, contact_email: s.contact_email,
        board: s.board, school_type: s.school_type,
        onboarding_completed: true,
      }).eq("id", school.id);
      if (schErr) throw schErr;

      // 2) Replace shifts
      await supabase.from("school_shifts").delete().eq("school_id", school.id);
      if (s.shifts.length) {
        const { error } = await supabase.from("school_shifts").insert(
          s.shifts.map((sh) => ({ school_id: school.id, name: sh.name, start_time: sh.start_time, end_time: sh.end_time }))
        );
        if (error) throw error;
      }

      // 3) Create session
      const sess = data.session;
      const { data: sessRow, error: sessErr } = await supabase.from("academic_sessions").insert({
        school_id: school.id, academic_year: sess.academic_year, start_date: sess.start_date,
        end_date: sess.end_date, term_structure: sess.term_structure, is_current: true,
      }).select("id").single();
      if (sessErr) throw sessErr;

      // 4) Classes -> sections, subjects
      for (let i = 0; i < sess.classes.length; i++) {
        const c = sess.classes[i];
        const { data: cls, error: cErr } = await supabase.from("classes").insert({
          school_id: school.id, session_id: sessRow.id, name: c.name, display_order: i,
        }).select("id").single();
        if (cErr) throw cErr;
        if (c.sections.length) {
          const { error } = await supabase.from("sections").insert(
            c.sections.map((sec) => ({ school_id: school.id, class_id: cls.id, name: sec.name }))
          );
          if (error) throw error;
        }
        if (c.subjects.length) {
          const { error } = await supabase.from("subjects").insert(
            c.subjects.map((sub) => ({ school_id: school.id, class_id: cls.id, name: sub.name, code: sub.code }))
          );
          if (error) throw error;
        }
      }

      toast({ title: "Setup complete!", description: "All modules unlocked." });
      await refresh();
      navigate("/", { replace: true });
    } catch (e: any) {
      toast({ title: "Setup failed", description: e.message ?? "Try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <AppShell>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">School Onboarding</h1>
          <p className="text-sm text-muted-foreground">Set up your school in 4 quick steps.</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            {STEPS.map((label, i) => (
              <div key={label} className={`flex items-center gap-1.5 ${i <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                <span className={`h-5 w-5 rounded-full inline-flex items-center justify-center text-[10px] ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary/20 text-primary border border-primary" : "bg-muted"}`}>
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Step {step + 1}: {STEPS[step]}</CardTitle></CardHeader>
          <CardContent>
            {step === 0 && <SchoolStep data={data.school} onChange={(d) => setData({ ...data, school: d })} />}
            {step === 1 && <SessionStep data={data.session} onChange={(d) => setData({ ...data, session: d })} />}
            {step === 2 && <SubjectsStep data={data.session} onChange={(d) => setData({ ...data, session: d })} />}
            {step === 3 && <SummaryStep data={data} />}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={back} disabled={step === 0 || submitting}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Save & Continue <ArrowRight className="h-4 w-4" /></Button>
          ) : (
            <Button onClick={submit} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Check className="h-4 w-4" /> Complete Setup</>}
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
