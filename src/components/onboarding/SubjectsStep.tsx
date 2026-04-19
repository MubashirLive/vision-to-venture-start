import { Plus, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Add subjects for each class. Codes auto-generate.</p>
      {data.classes.map((cls, ci) => (
        <ClassPanel
          key={ci}
          className={cls.name}
          subjects={cls.subjects}
          onChange={(s) => updateClass(ci, s)}
          defaultOpen={ci === 0}
        />
      ))}
    </div>
  );
}

function ClassPanel({ className, subjects, onChange, defaultOpen }: {
  className: string; subjects: SubjectDraft[]; onChange: (s: SubjectDraft[]) => void; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [name, setName] = useState("");

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed || subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    const code = generateSubjectCode(trimmed, subjects.map((s) => s.code));
    onChange([...subjects, { name: trimmed, code }]);
    setName("");
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border rounded-md">
      <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="font-medium">{className}</span>
          <span className="text-xs text-muted-foreground">({subjects.length} subject{subjects.length !== 1 ? "s" : ""})</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="p-3 pt-0 space-y-3 border-t">
        <div className="flex gap-2 pt-3">
          <Input
            value={name}
            placeholder="e.g. Mathematics"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          />
          <Button type="button" onClick={add}><Plus className="h-4 w-4" /> Add Subject</Button>
        </div>
        {subjects.length === 0 ? (
          <p className="text-xs text-muted-foreground">No subjects yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {subjects.map((s, i) => (
              <li key={i} className="flex items-center justify-between text-sm rounded-md border px-3 py-2">
                <div className="flex items-center gap-2">
                  <span>{s.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{s.code}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(subjects.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${s.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
