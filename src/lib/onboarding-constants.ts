export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
] as const;

export const ACADEMIC_BOARDS = ["CBSE", "ICSE", "State Board", "IB", "IGCSE"] as const;
export const SCHOOL_TYPES = ["Private", "Public", "International"] as const;
export const ACADEMIC_YEARS = ["2024-25", "2025-26", "2026-27"] as const;
export const TERM_STRUCTURES = ["Annual", "Term 1 & 2", "Semester 1 & 2"] as const;

export const DEFAULT_CLASSES = [
  "Nursery","LKG","UKG",
  "Class 1","Class 2","Class 3","Class 4","Class 5","Class 6",
  "Class 7","Class 8","Class 9","Class 10","Class 11","Class 12",
];

export const SUBJECT_CODE_MAP: Record<string, string> = {
  mathematics: "MAT", maths: "MAT", math: "MAT",
  science: "SCI", physics: "PHY", chemistry: "CHE", biology: "BIO",
  english: "ENG", hindi: "HIN", sanskrit: "SAN",
  "social science": "SST", history: "HIS", geography: "GEO", civics: "CIV",
  "computer science": "CSC", computers: "CSC",
  economics: "ECO", "physical education": "PED", art: "ART", music: "MUS",
};

export function generateSubjectCode(name: string, existingCodes: string[]): string {
  const lower = name.toLowerCase().trim();
  const prefix = SUBJECT_CODE_MAP[lower] ?? lower.replace(/[^a-z]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
  let n = 101;
  while (existingCodes.includes(`${prefix}${n}`)) n++;
  return `${prefix}${n}`;
}
