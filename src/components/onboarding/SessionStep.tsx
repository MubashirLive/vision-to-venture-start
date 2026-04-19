import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACADEMIC_YEARS, DEFAULT_CLASSES, TERM_STRUCTURES } from "@/lib/onboarding-constants";
import type { SessionStepData, ClassDraft } from "./types";
import { useState } from "react";

interface Props {
  data: SessionStepData;
  onChange: (d: SessionStepData) => void;
}

export function SessionStep({ data, onChange }: Props) {
  const [newClass, setNewClass] = useState("");
  const set = <K extends keyof SessionStepData>(k: K, v: SessionStepData[K]) => onChange({ ...data, [k]: v });

  const addClass = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || data.classes.some((c) => c.name === trimmed)) return;
    const newCls: ClassDraft = {
      name: trimmed,
      sections: [{ name: "A" }],
      subjects: [],
    };
    set("classes", [...data.classes, newCls]);
  };
  const removeClass = (i: number) => set("classes", data.classes.filter((_, idx) => idx !== i));
  const updateClass = (i: number, patch: Partial<ClassDraft>) =>
    set("classes", data.classes.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const addSection = (i: number) => {
    const cls = data.classes[i];
    const next = String.fromCharCode(65 + cls.sections.length);
    updateClass(i, { sections: [...cls.sections, { name: next }] });
  };
  const updateSection = (ci: number, si: number, name: string) => {
    const cls = data.classes[ci];
    updateClass(ci, { sections: cls.sections.map((s, idx) => (idx === si ? { name } : s)) });
  };
  const removeSection = (ci: number, si: number) => {
    const cls = data.classes[ci];
    updateClass(ci, { sections: cls.sections.filter((_, idx) => idx !== si) });
  };

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Academic Year *">
          <Select value={data.academic_year} onValueChange={(v) => set("academic_year", v)}>
            <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
            <SelectContent>
              {ACADEMIC_YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Term Structure *">
          <Select value={data.term_structure} onValueChange={(v) => set("term_structure", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {TERM_STRUCTURES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Start Date *">
          <Input type="date" value={data.start_date} onChange={(e) => set("start_date", e.target.value)} />
        </Field>
        <Field label="End Date *">
          <Input type="date" value={data.end_date} onChange={(e) => set("end_date", e.target.value)} />
        </Field>
      </div>

      <div className="space-y-3 pt-2 border-t">
        <div>
          <Label className="text-base">Classes</Label>
          <p className="text-xs text-muted-foreground">Add classes and their sections.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {DEFAULT_CLASSES.map((c) => {
            const exists = data.classes.some((x) => x.name === c);
            return (
              <Button key={c} type="button" size="sm" variant={exists ? "secondary" : "outline"}
                disabled={exists} onClick={() => addClass(c)}>
                + {c}
              </Button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Input placeholder="Custom class name" value={newClass} onChange={(e) => setNewClass(e.target.value)} />
          <Button type="button" onClick={() => { addClass(newClass); setNewClass(""); }}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          {data.classes.map((cls, ci) => (
            <div key={ci} className="border rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{cls.name}</div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeClass(ci)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {cls.sections.map((s, si) => (
                  <Badge key={si} variant="secondary" className="gap-1 pr-1">
                    <input
                      value={s.name}
                      onChange={(e) => updateSection(ci, si, e.target.value)}
                      className="bg-transparent w-12 outline-none text-xs"
                    />
                    <button onClick={() => removeSection(ci, si)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button type="button" size="sm" variant="outline" onClick={() => addSection(ci)}>
                  <Plus className="h-3 w-3" /> Section
                </Button>
              </div>
            </div>
          ))}
          {data.classes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No classes added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
