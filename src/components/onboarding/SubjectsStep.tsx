import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { generateSubjectCode } from "@/lib/onboarding-constants";
import type { SessionStepData, SubjectDraft } from "./types";

interface Props {
  data: SessionStepData;
  onChange: (d: SessionStepData) => void;
}

export function SubjectsStep({ data, onChange }: Props) {
  const updateClass = (i: number, subjects: SubjectDraft[]) => {
    onChange({ ...data, classes: data.classes.map((c, idx) => (idx === i ? { ...c, subjects } : c)) });
  };

  if (data.classes.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Add classes in the previous step first.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Add subjects for each class. Codes auto-generate.</p>
      {data.classes.map((cls, ci) => (
        <ClassSubjects key={ci} className={cls.name} subjects={cls.subjects} onChange={(s) => updateClass(ci, s)} />
      ))}
    </div>
  );
}

function ClassSubjects({ className, subjects, onChange }: {
  className: string; subjects: SubjectDraft[]; onChange: (s: SubjectDraft[]) => void;
}) {
  const [name, setName] = useState("");

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed || subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    const code = generateSubjectCode(trimmed, subjects.map((s) => s.code));
    onChange([...subjects, { name: trimmed, code }]);
    setName("");
  };

  return (
    <div className="border rounded-md p-3 space-y-2">
      <div className="font-medium">{className}</div>
      <div className="flex gap-2">
        <Input
          value={name}
          placeholder="e.g. Mathematics"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <Button type="button" onClick={add}><Plus className="h-4 w-4" /> Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {subjects.map((s, i) => (
          <Badge key={i} variant="secondary" className="gap-1.5 pr-1">
            <span>{s.name}</span>
            <span className="text-xs opacity-70">{s.code}</span>
            <button onClick={() => onChange(subjects.filter((_, idx) => idx !== i))} className="hover:text-destructive ml-1">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {subjects.length === 0 && <span className="text-xs text-muted-foreground">No subjects yet.</span>}
      </div>
    </div>
  );
}
