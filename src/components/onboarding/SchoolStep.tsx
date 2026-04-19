import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACADEMIC_BOARDS, INDIAN_STATES, SCHOOL_TYPES } from "@/lib/onboarding-constants";
import type { SchoolStepData } from "./types";

interface Props {
  data: SchoolStepData;
  onChange: (d: SchoolStepData) => void;
  errors?: Partial<Record<keyof SchoolStepData, string>>;
}

export function SchoolStep({ data, onChange, errors = {} }: Props) {
  const set = <K extends keyof SchoolStepData>(k: K, v: SchoolStepData[K]) =>
    onChange({ ...data, [k]: v });

  const addShift = () =>
    set("shifts", [...data.shifts, { name: `Shift ${data.shifts.length + 1}`, start_time: "08:00", end_time: "14:00" }]);
  const removeShift = (i: number) => set("shifts", data.shifts.filter((_, idx) => idx !== i));
  const updateShift = (i: number, key: keyof typeof data.shifts[number], val: string) =>
    set("shifts", data.shifts.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)));

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="School Name *" error={errors.name}>
          <Input value={data.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
        </Field>
        <Field label="Acronym *" error={errors.acronym}>
          <Input value={data.acronym} maxLength={10} placeholder="e.g. DPS"
            onChange={(e) => set("acronym", e.target.value.toUpperCase())} aria-invalid={!!errors.acronym} />
        </Field>
      </div>

      <Field label="Address *" error={errors.address}>
        <Input value={data.address} onChange={(e) => set("address", e.target.value)} aria-invalid={!!errors.address} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="City *" error={errors.city}>
          <Input value={data.city} onChange={(e) => set("city", e.target.value)} aria-invalid={!!errors.city} />
        </Field>
        <Field label="State *" error={errors.state}>
          <Select value={data.state} onValueChange={(v) => set("state", v)}>
            <SelectTrigger aria-invalid={!!errors.state}><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Contact Number *" error={errors.contact_phone}>
          <Input
            value={data.contact_phone}
            placeholder="+91 9876543210"
            onChange={(e) => set("contact_phone", e.target.value)}
            aria-invalid={!!errors.contact_phone}
          />
        </Field>
        <Field label="Email *" error={errors.contact_email}>
          <Input type="email" value={data.contact_email} onChange={(e) => set("contact_email", e.target.value)} aria-invalid={!!errors.contact_email} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Academic Board *" error={errors.board}>
          <Select value={data.board} onValueChange={(v) => set("board", v)}>
            <SelectTrigger aria-invalid={!!errors.board}><SelectValue placeholder="Select board" /></SelectTrigger>
            <SelectContent>
              {ACADEMIC_BOARDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="School Type *" error={errors.school_type}>
          <Select value={data.school_type} onValueChange={(v) => set("school_type", v)}>
            <SelectTrigger aria-invalid={!!errors.school_type}><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {SCHOOL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Shifts</Label>
          <Button type="button" size="sm" variant="outline" onClick={addShift}>
            <Plus className="h-4 w-4" /> Add Shift
          </Button>
        </div>
        <div className="space-y-2">
          {data.shifts.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center p-2 border rounded-md">
              <Input value={s.name} onChange={(e) => updateShift(i, "name", e.target.value)} placeholder="Name" />
              <Input type="time" value={s.start_time} onChange={(e) => updateShift(i, "start_time", e.target.value)} className="w-28" />
              <Input type="time" value={s.end_time} onChange={(e) => updateShift(i, "end_time", e.target.value)} className="w-28" />
              <Button type="button" size="icon" variant="ghost" disabled={data.shifts.length <= 1} onClick={() => removeShift(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className={error ? "text-destructive" : undefined}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
