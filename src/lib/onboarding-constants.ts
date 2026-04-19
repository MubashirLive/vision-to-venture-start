export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
] as const;

export const ACADEMIC_BOARDS = ["CBSE", "ICSE", "State Board", "IB"] as const;
export const SCHOOL_TYPES = ["Private", "Public", "International"] as const;
export const ACADEMIC_YEARS = ["2024-25", "2025-26", "2026-27"] as const;
export const TERM_STRUCTURES = ["Term 1+2", "Semester 1+2", "Annual"] as const;

export const DEFAULT_CLASSES = [
  "Nursery","LKG","UKG","1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th","11th","12th",
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
