
# SHARP v0.1 — Core SIS (Web App)

A focused multi-tenant Student Information System you can demo to a school in a few weeks. We deliberately leave out Messenger, Homework, Timetable, HR/Payroll, Analytics, Fees, etc. — those come *after* a real school says "I'd pay for this."

## What we're building in v0.1

### 1. Authentication & Roles
- Email + password login (Lovable Cloud)
- 5 roles: **Super Admin, Principal, Admin, Teacher, Student/Parent** (Non-Teaching staff added later)
- Roles stored in a separate `user_roles` table (security best practice)
- Each user belongs to a `school_id` (except Super Admin)

### 2. Multi-Tenancy (built right from Day 1)
- One database, every row tagged with `school_id`
- Row-Level Security (RLS) so School A can never see School B
- No subdomains yet — schools just log in at the same URL and land in their own school
- Branding (logo, school name, primary color) stored per school and shown in the UI

### 3. Super Admin Console
- List all schools on the platform
- Create / activate / deactivate a school
- Create the Principal account for a new school (one-click invite)
- Basic counts: # schools, # active users

### 4. School Onboarding Wizard (Principal does this once)
Step-by-step, with progress saved. Modules stay locked until this is done.
1. **School Form** — name, address, board (CBSE/ICSE/State), logo upload, contact, wings (Pre-Primary / Primary / Secondary / Sr. Secondary)
2. **Session Form** — academic year, working days, school timing, period duration
3. **Classes & Sections** — Class 1–12, sections A/B/C (configurable)
4. **Subjects per class**
5. **Admin account creation** (Principal invites Admin via email)

### 5. People Management
- **Students**: add one-by-one OR bulk Excel/CSV upload with row-level error reporting ("Row 5: phone missing"). Auto-generates Student ID. Captures father/mother name, contact, class, section, DOB.
- **Teachers / Staff**: add one-by-one OR bulk. Auto-generates Staff ID. Captures basic profile + assigned classes/subjects.
- Edit, deactivate (never hard-delete — keeps historical attendance valid later).

### 6. Basic Attendance (the one "live" module in v1)
- **Class Teacher** marks daily attendance: Present / Absent / Leave toggle per student
- **Student/Parent** sees their own monthly calendar, color-coded
- **Admin/Principal** sees class-wise daily summary
- Rule enforced: cannot mark attendance for past dates (same-day only)
- Locked until onboarding is complete and academic year is set

### 7. School Profile & Branding
- Principal can update logo, colors, school name anytime — reflected across the app
- Read-only school info card on every user's home

### 8. Foundation we set up now (so future modules are easy)
- Notification table (empty UI placeholder, but schema ready) so Homework/Notices later are trivial
- File storage bucket per school (for logos now, documents later)
- Audit log on sensitive actions (who deactivated whom)

## What's intentionally NOT in v0.1
Messenger, Broadcasts, Pop-ups, Feed, Analytics dashboard, MyDocs, Resources, Homework module, Timetable, Calendar, Complaints, Code of Conduct, Lesson Planner, Task Manager, HR/Payroll, Fees, Subdomains, native Android, Push notifications.

Each of these becomes its own follow-up plan once v0.1 is solid.

## Tech & UX choices
- **Stack**: React + Tailwind + Lovable Cloud (Postgres + Auth + Storage + RLS) — what Lovable does best
- **Design**: Clean, calm, India-school-friendly (think: lots of whitespace, clear Hindi-friendly typography support later, mobile-first because most teachers will use phones)
- **Mobile**: Fully responsive web. Works in any phone browser today. We can wrap it as an installable PWA in a later step, and a Kotlin Android app comes much later when revenue justifies it.

## Suggested order of implementation (so you always have something demo-able)
1. Auth + roles + multi-tenant scaffolding + Super Admin can create a school & Principal
2. Onboarding wizard + School profile + branding
3. Students module (one-by-one + bulk upload)
4. Teachers/Staff module (one-by-one + bulk upload)
5. Classes/Sections/Subjects
6. Attendance module
7. Polish, empty states, error handling, and a seeded demo school you can show

## What I need from you alongside building
- A real school's logo + name we can use in the demo (even a fictional "Green Valley Public School" is fine)
- A sample Excel of 20–30 students in the format your target schools actually use — so the bulk-upload feels real on Day 1
- Decide pricing tier *thinking* (not final): what would you charge a 500-student school per month? This shapes which modules are "free tier" vs "paid" later.

Once you approve, I'll start with step 1 (auth + multi-tenant foundation + Super Admin console) so you can see the spine working end-to-end before we add modules on top.
