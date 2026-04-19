export interface ShiftDraft {
  name: string;
  start_time: string;
  end_time: string;
}

export interface SchoolStepData {
  name: string;
  acronym: string;
  address: string;
  city: string;
  state: string;
  contact_phone: string;
  contact_email: string;
  board: string;
  school_type: string;
  shifts: ShiftDraft[];
}

export interface SectionDraft {
  name: string;
}

export interface SubjectDraft {
  name: string;
  code: string;
}

export interface ClassDraft {
  name: string;
  sections: SectionDraft[];
  subjects: SubjectDraft[];
}

export interface SessionStepData {
  academic_year: string;
  start_date: string;
  end_date: string;
  term_structure: string;
  classes: ClassDraft[];
}

export interface WizardData {
  school: SchoolStepData;
  session: SessionStepData;
}
