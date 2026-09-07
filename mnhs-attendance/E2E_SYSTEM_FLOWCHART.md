# MNHS Attendance Monitoring System - End-to-End System Flowchart

**Version:** 1.0  
**Date:** September 6, 2026  
**System:** MNHS Attendance Monitoring System

---

## 1. ACTORS (User Roles)

| Actor | Role Value | Capabilities |
|-------|------------|--------------|
| **Super Admin** | `super_admin` | Full system access, user management, audit logs, AI, all CRUD operations |
| **Admin** | `admin` | Student/sections management, attendance, admission slips, analytics, AI, user management (no audit logs) |
| **Teacher** | `teacher` | Assigned sections only, student CRUD for assigned sections, manual attendance, AI (limited) |
| **Security Guard** | `security_guard` | QR code scanning for attendance (time_in/time_out), guard schedule |
| **Student** | `student` | View own dashboard, QR code, admission slips (own), profile |

---

## 2. HIGH-LEVEL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MNHS ATTENDANCE SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │   USER ROLES │    │   WEB UI     │    │   Laravel    │    │  Database  │ │
│  │              │    │  (Inertia +  │    │   Backend    │    │  (MySQL)   │ │
│  │  - Super Ad  │───▶│   React.js)  │───▶│   + Actions  │───▶│            │ │
│  │  - Admin     │    │              │    │   + Mail     │    │            │ │
│  │  - Teacher   │    │              │    │   + Audit    │    │            │ │
│  │  - Guard     │    │              │    │              │    │            │ │
│  │  - Student   │    │              │    │              │    │            │ │
│  └──────────────┘    └──────────────┘    └──────────────┘    └────────────┘ │
│                                      │                                      │
│                                      ▼                                      │
│                          ┌─────────────────────┐                           │
│                          │  External Services  │                           │
│                          │  - Google OAuth     │                           │
│                          │  - AI Provider      │                           │
│                          │  - Email (Mail)     │                           │
│                          └─────────────────────┘                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. AUTHENTICATION & AUTHORIZATION FLOW

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION FLOW                                    │
│                                                                                  │
│  ┌──────────┐                                                                       │
│  │   Guest  │                                                                       │
│  └───┬──────┘                                                                       │
│      │                                                                               │
│      ▼                                                                               │
│  ┌─────────────────────────────┐                                                    │
│  │        WEB PAGE             │  Public routes: /login, /register, /auth/google  │
│  │  ┌───────────────────────┐  │                                                    │
│  │  │ Login Form            │  │                                                    │
│  │  │ - Email               │  │                                                    │
│  │  │ - Password            │  │                                                    │
│  │  │ - "Remember Me"       │  │                                                    │
│  │  └───────────────────────┘  │                                                    │
│  │         │                   │                                                    │
│  │         ▼ (POST /login)    │                                                    │
│  │  ┌───────────────────────┐  │                                                    │
│  │  │ AuthenticatedSession  │  │  Middleware: guest, throttle:5,1                  │
│  │  │ Controller::store()   │  │                                                    │
│  │  └──────────┬────────────┘  │                                                    │
│  │             │                │                                                    │
│  │             ▼                │                                                    │
│  │  ┌───────────────────────┐  │                                                    │
│  │  │ Validate Credentials  │  │  LoginRequest: email required, password required   │
│  │  │ - Check email exists  │  │                                                    │
│  │  │ - Verify password     │  │                                                    │
│  │  └──────────┬────────────┘  │                                                    │
│  │             │                │                                                    │
│  │     ┌───────┴───────┐       │                                                    │
│  │     │               │       │                                                    │
│  │   FAILED          SUCCESS   │                                                    │
│  │     │               │       │                                                    │
│  │     ▼               ▼       │                                                    │
│  │  ┌──────────┐  ┌─────────────────────┐                                            │
│  │  │ Show      │  │ Create Session      │                                            │
│  │  │ Error     │  │ - Set auth cookie   │                                            │
│  │  │ Message   │  │ - Check is_active   │  ───────────────────────────────────────── │
│  │  │ + Retry   │  │ - Check role        │  │ Active User Check (middleware)              │
│  │  └──────────┘  │ - Redirect to       │  │ - is_active = false → 403                   │
│  │                 │   dashboard        │  │ - Deny access to protected routes          │
│  │                 └────────┬───────────┘  └─────────────────────────────────────────┘
│  │                          │                                                       │
│  └──────────────────────────┼───────────────────────────────────────────────────────┘
│                             │
│                             ▼
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │                    POST-LOGIN: ROLE-BASED MIDDLEWARE                        │
│  │                                                                             │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │  │ super_admin      │  │ admin            │  │ teacher                  │   │
│  │  │ - Full access    │  │ - Students CRUD  │  │ - Assigned sections only │   │
│  │  │ - User mgmt      │  │ - Sections CRUD  │  │ - Manual attendance      │   │
│  │  │ - Audit logs     │  │ - Attendance     │  │ - AI (limited context)   │   │
│  │  │ - AI             │  │ - Admission slips│  │                          │   │
│  │  │ - All features   │  │ - Analytics      │  │                          │   │
│  │  └──────────────────┘  │ - AI             │  │                          │   │
│  │                         │ - User mgmt     │  │                          │   │
│  │                         └──────────────────┘  │                          │   │
│  │  ┌──────────────────┐                        └──────────────────────────┘   │
│  │  │ security_guard   │                                                         │
│  │  │ - QR scan only   │                                                         │
│  │  │ - Guard schedule │                                                         │
│  │  │ - Recent scans   │                                                         │
│  │  └──────────────────┘                                                         │
│  │  ┌──────────────────┐                                                         │
│  │  │ student          │                                                         │
│  │  │ - Own dashboard  │                                                         │
│  │  │ - Own QR code    │                                                         │
│  │  │ - Own admission  │                                                         │
│  │  │   slips          │                                                         │
│  │  └──────────────────┘                                                         │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. STUDENT MANAGEMENT FLOW

### 4.1 CREATE STUDENT (Super Admin / Admin / Teacher)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CREATE STUDENT FLOW                                      │
│                                                                                  │
│  ┌──────────────┐                                                                   │
│  │   Actor      │  Super Admin / Admin / Teacher (assigned section)               │
│  │   (CRUD)     │                                                                   │
│  └──────┬───────┘                                                                   │
│         │                                                                           │
│         ▼                                                                           │
│  ┌─────────────────────────────┐                                                    │
│  │  GET /students/create       │  Route: students.create                          │
│  │  Middleware: auth           │                                                    │
│  │  Authorize: create, Student │                                                    │
│  └──────────────┬──────────────┘                                                    │
│                 │                                                                   │
│                 ▼                                                                   │
│  ┌───────────────────────────────────────┐                                          │
│  │  StudentController::create()          │                                          │
│  │  - Get sections based on role:        │                                          │
│  │    • Teacher: assignedSections only   │                                          │
│  │    • Others: all Section::with(...)   │                                          │
│  │  - Get GradeLevel::orderBy(...)       │                                          │
│  └───────────────────┬───────────────────┘                                          │
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────┐                                          │
│  │  Inertia: Students/Create.jsx         │  Form fields:                            │
│  │  Props:                               │  - first_name (required)                 │
│  │  - sections (filtered by role)        │  - last_name (required)                  │
│  │  - gradeLevels                         │  - lrn (12-digit, required)              │
│  │  - user                               │  - section_id (nullable, filters for     │
│  │                                       │    teacher to assigned only)             │
│  │                                       │  - guardian_name (optional)              │
│  │                                       │  - guardian_email (optional)             │
│  │                                       │  - photo (optional)                      │
│  └───────────────────────────────────────┘                                          │
│                      │                                                               │
│                      ▼ (User submits form)                                           │
│  ┌───────────────────────────────────────┐                                          │
│  │  POST /students                      │  Route: students.store                      │
│  │  StoreStudentRequest Validation:     │  Rules:                                    │
│  │  - first_name: required              │  - lrn: 12 digits                         │
│  │  - last_name: required               │  - section_id: exists, nullable          │
│  │  - lrn: required, 12 digits          │  - guardian_email: email, nullable       │
│  │  - section_id: exists|nullable       │                                            │
│  │  - guardian_email: email|nullable    │                                            │
│  └───────────────────┬───────────────────┘                                          │
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────┐                                          │
│  │  StudentController::store()           │                                          │
│  │  - Authorize: create, Student        │                                          │
│  │  - Call CreateStudent::handle()      │                                          │
│  └───────────────────┬───────────────────┘                                          │
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  CreateStudent::handle($data, $actor)                                         │
│  │                                                                               │
│  │  1. SECTION ACCESS CHECK (Teacher only):                                      │
│  │     - If actor is teacher && section_id set:                                  │
│  │     - Check actor->assignedSections()->where('sections.id', sectionId)        │
│  │     - If not found → ValidationException ("You can only add students...")     │
│  │                                                                               │
│  │  2. PROCESS PHOTO (if uploaded):                                              │
│  │     - Store to 'student-photos' disk (public)                                 │
│  │     - Set photo_path in data                                                  │
│  │                                                                               │
│  │  3. CREATE USER ACCOUNT:                                                     │
│  │     - Generate unique student email:                                          │
│  │       • Pattern: {first}.{last}@student.mnhs.edu                              │
│  │       • Handle duplicates with numeric suffix                                 │
│  │     - User::create([                                                          │
│  │         name: "{first} {last}",                                              │
│  │         email: generated_email,                                              │
│  │         password: Hash::make('Password123!'),                                │
│  │         role: 'student',                                                     │
│  │         is_active: true,                                                     │
│  │         force_password_change: false,                                        │
│  │         email_verified_at: now(),                                            │
│  │       ])                                                                      │
│  │                                                                               │
│  │  4. CREATE STUDENT RECORD:                                                   │
│  │     - Str::uuid() for qr_token                                               │
│  │     - Student::create([                                                      │
│  │         user_id: $user->id,                                                  │
│  │         lrn: $data['lrn'],                                                   │
│  │         first_name, last_name, middle_name,                                  │
│  │         section_id, photo_path,                                              │
│  │         guardian_name, guardian_email,                                       │
│  │         qr_token: (string) Str::uuid(),                                      │
│  │         is_active: true,                                                     │
│  │       ])                                                                      │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────┐                                          │
│  │  Redirect: students.show              │  Success message: "Student created..."     │
│  │  - Load student with:                │                                          │
│  │    • section.gradeLevel              │                                          │
│  │    • attendanceRecords (last 30)     │                                          │
│  │  - Generate QR SVG (200px)           │                                          │
│  └───────────────────────────────────────┘                                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 CSV/XLSX STUDENT IMPORT (Super Admin / Admin)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CSV/XLSX STUDENT IMPORT FLOW                                │
│                                                                                  │
│  ┌──────────────┐                                                                   │
│  │   Actor      │  Super Admin / Admin only (role:super_admin,admin)              │
│  └──────┬───────┘                                                                   │
│         │                                                                           │
│         ▼                                                                           │
│  ┌─────────────────────────────┐                                                    │
│  │  GET /students/import/csv   │  Route: students.import-csv                       │
│  │  Middleware:                │  - auth                                       │
│  │  - role:super_admin,admin   │  - role:super_admin,admin                        │
│  │  Authorize: canImportStudents│                                                   │
│  └──────────────┬──────────────┘                                                    │
│                 │                                                                   │
│                 ▼                                                                   │
│  ┌───────────────────────────────────────┐                                          │
│  │  CsvImportController::index()         │                                          │
│  │  - Get all Section::all()             │                                          │
│  │  - Check XLSX support (PhpSpreadsheet)│                                          │
│  └───────────────────┬───────────────────┘                                          │
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────┐                                          │
│  │  Inertia: Students/ImportCsv.jsx      │  UI:                                      │
│  │  Props:                               │  - File upload input                      │
│  │  - sections                           │  - Section dropdown (optional filter)     │
│  │  - user                               │  - XLSX support indicator                 │
│  │  - xlsxSupported                      │  - Submit button                          │
│  └───────────────────────────────────────┘                                          │
│                      │                                                               │
│                      ▼ (User uploads file + submits)                                 │
│  ┌───────────────────────────────────────┐                                          │
│  │  POST /students/import/csv            │  Route: students.import-csv.store          │
│  │  Middleware:                          │  - auth                                   │
│  │  - role:super_admin,admin             │  - role:super_admin,admin                  │
│  │  - throttle:10,1                      │  - Rate limit: 10 requests/minute          │
│  │  ImportStudentsRequest Validation:    │  Rules:                                    │
│  │  - csv_file: required, file           │  - mimes: csv, xlsx                       │
│  │  - csv_file: mimes:csv,xlsx          │  - max: 10240 (10MB)                      │
│  │  - section_id: nullable               │                                            │
│  └───────────────────┬───────────────────┘                                          │
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  CsvImportController::store()                                                 │
│  │  - Authorize: canImportStudents, Student                                     │
│  │  - Call ImportStudentsFromCsv::handle($file, $sectionId, $user)              │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  ImportStudentsFromCsv::handle($file, $sectionId, $actor)                    │
│  │                                                                               │
│  │  1. DETECT FILE TYPE:                                                         │
│  │     - Extension check: .csv or .xlsx                                         │
│  │                                                                               │
│  │  2. FOR CSV FILES (readCsv):                                                 │
│  │     - file_get_contents($file)                                               │
│  │     - str_getcsv() for each line                                             │
│  │     - BOM character handling                                                 │
│  │     - Skip empty lines                                                        │
│  │                                                                               │
│  │  3. FOR XLSX FILES (readXlsx):                                               │
│  │     - PhpSpreadsheet IOFactory::load()                                       │
│  │     - Read first sheet                                                        │
│  │     - Iterate rows starting from row 2 (header is row 1)                      │
│  │                                                                               │
│  │  4. VALIDATE EACH ROW:                                                       │
│  │     - Required: first_name, last_name, lrn                                    │
│  │     - LRN must be exactly 12 digits                                          │
│  │     - Section validation if section_id provided                               │
│  │     - Duplicate LRN check (against database)                                  │
│  │                                                                               │
│  │  5. CREATE STUDENTS (using CreateStudent::handle):                           │
│  │     - For each valid row, call CreateStudent                                 │
│  │     - Track success/failure counts                                           │
│  │     - Collect error messages per row                                         │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────┐                                          │
│  │  Flash session: import_result         │  Success message format:                   │
│  │  Redirect: students.index             │  "X student(s) imported successfully."      │
│  │                                       │  Or: "No students were imported."           │
│  │                                       │  Errors shown per-row in UI                │
│  └───────────────────────────────────────┘                                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 STUDENT CRUD OPERATIONS (View/Edit/Delete)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         STUDENT MANAGEMENT FLOW                                  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  INDEX - GET /students (students.index)                                      │
│  │  - Authorize: viewAny, Student                                               │
│  │  - Search: first_name, last_name, lrn (LIKE %)                               │
│  │  - Filter: section_id                                                         │
│  │  - Teacher only: filter to assignedSections                                  │
│  │  - Paginate (1-100 per page)                                                 │
│  │  - Inertia: Students/Index.jsx                                               │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  VIEW - GET /students/{student} (students.show)                              │
│  │  - Authorize: view, Student                                                  │
│  │  - Load: section.gradeLevel, attendanceRecords (last 30)                     │
│  │  - Generate QR SVG (200px) from student.qr_token                             │
│  │  - Inertia: Students/Show.jsx                                                │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  EDIT - GET /students/{student}/edit (students.edit)                         │
│  │  - Authorize: update, Student                                                │
│  │  - Teacher: lock section field to assigned section only                       │
│  │  - Load: sections (filtered), gradeLevels, isTeacher flag                    │
│  │  - Inertia: Students/Edit.jsx                                                │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  UPDATE - PUT/PATCH /students/{student} (students.update)                    │
│  │  - Authorize: update, Student                                                │
│  │  - UpdateStudent::handle($student, $validated)                               │
│  │  - Photo update supported                                                    │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  DELETE - DELETE /students/{student} (students.destroy)                      │
│  │  - Authorize: delete, Student                                                │
│  │  - Soft delete via $student->delete()                                        │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  QR CODE PRINTING                                                             │
│  │  - Single: GET /students/{student}/print-qr (students.print-qr)             │
│  │    • Authorize: view, Student                                                │
│  │    • QR SVG at 240px                                                         │
│  │  - Bulk: GET /students/bulk-print-qr (students.bulk-print-qr)               │
│  │    • Authorize: viewAny, Student                                             │
│  │    • Filter by section_id, grade_level_id                                    │
│  │    • Teacher: filter to assigned sections                                    │
│  │    • QR SVG at 180px per student                                             │
│  └─────────────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. ATTENDANCE RECORDING FLOW

### 5.1 QR CODE SCAN (Security Guard - Primary Attendance Method)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         QR CODE SCAN FLOW (GUARD)                               │
│                                                                                  │
│  ┌──────────────┐                                                                   │
│  │   Actor      │  Security Guard (role:security_guard)                           │
│  └──────┬───────┘                                                                   │
│         │                                                                           │
│         ▼                                                                           │
│  ┌─────────────────────────────┐                                                    │
│  │  GET /guard/scan            │  Route: guard.scan                                 │
│  │  Middleware:                │  - auth                                          │
│  │  - role:security_guard      │  - role:security_guard                             │
│  │  Schedule display + Recent  │                                                    │
│  │  attendance list (last 20)  │                                                    │
│  └──────────────┬──────────────┘                                                    │
│                 │                                                                   │
│                 ▼                                                                   │
│  ┌───────────────────────────────────────┐                                          │
│  │  QRScanController::index()            │                                          │
│  │  - Get guard schedule (today)         │                                          │
│  │  - Get recent attendance (today, 20) │                                          │
│  └───────────────────┬───────────────────┘                                          │
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────┐                                          │
│  │  Inertia: Guard/Scan.jsx              │  UI:                                      │
│  │  Props:                               │  - Guard schedule (time_in/time_out)      │
│  │  - schedule                           │  - QR input (token or LRN)                │
│  │  - recentAttendance                   │  - Mode selector (Auto / Time In /         │
│  │                                       │    Time Out)                               │
│  │                                       │  - Scan button                             │
│  │                                       │  - Recent scans list (live updates)        │
│  └───────────────────────────────────────┘                                          │
│                      │                                                               │
│                      ▼ (Guard enters QR token/LRN + clicks scan)                    │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  POST /guard/scan                                                             │
│  │  Route: guard.scan.store                                                      │
│  │  Middleware:                                                                  │
│  │  - auth                                                                       │
│  │  - role:security_guard                                                        │
│  │  - throttle:60,1 (60 scans/minute max)                                       │
│  │  ScanStudentQrRequest Validation:                                             │
│  │  - qr_token: nullable, string                                                 │
│  │  - lrn: nullable, string                                                      │
│  │  - mode: nullable, in:auto,time_in,time_out                                  │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  QRScanController::scan()                                                     │
│  │  - Call ProcessQrScan::handle($qrToken, $lrn, $ip, $userAgent,                │
│  │    $scheduledTime, $mode)                                                     │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  ProcessQrScan::handle() ─── MAIN SCAN LOGIC                                 │
│  │                                                                               │
│  │  STEP 1: FIND STUDENT                                                         │
│  │  - Query: Student::where(qr_token = $qrToken OR lrn = $lrn)                  │
│  │  - With: section                                                              │
│  │  - If not found → QrScanDeniedException('invalid_qr', 404)                   │
│  │                                                                               │
│  │  STEP 2: CHECK STUDENT IS ACTIVE                                              │
│  │  - If !student->is_active → QrScanDeniedException('inactive', 403)           │
│  │                                                                               │
│  │  STEP 3: CHECK FOR EXISTING TODAY RECORD                                      │
│  │  - AttendanceRecord::withTrashed()->where(student_id, date=today)->first()   │
│  │  - If soft-deleted record found, flag for restoration                         │
│  │                                                                               │
│  │  STEP 4: PARSE SCHEDULED TIMES (if guard schedule set)                        │
│  │  - Format: "HH:MM|HH:MM" → time_in|time_out                                   │
│  │                                                                               │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  │  BRANCH: EXISTING RECORD FOUND                                           │ │
│  │  │                                                                          │ │
│  │  │  - If time_out already set → QrScanDeniedException('already_scanned')   │ │
│  │  │    Status: 409 (Conflict)                                                │ │
│  │  │                                                                          │ │
│  │  │  - If mode = 'time_in' → QrScanDeniedException('already_timed_in')      │ │
│  │  │    Status: 409 (Conflict)                                                │ │
│  │  │    Message: "Student has already timed in today. Use Time Out..."        │ │
│  │  │                                                                          │ │
│  │  │  - If mode = 'time_out' or 'auto' → PROCESS TIME OUT                     │ │
│  │  │    → processTimeOut($existing, $student, ...)                            │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │
│  │                                                                               │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  │  BRANCH: NO EXISTING RECORD (Time In Mode)                              │ │
│  │  │                                                                          │ │
│  │  │  - If mode = 'time_out' → QrScanDeniedException('not_timed_in')         │ │
│  │  │    Status: 409                                                           │ │
│  │  │                                                                          │ │
│  │  │  - CHECK ADMISSION SLIP REQUIRED:                                        │ │
│  │  │    → requiresApprovedAdmissionSlip($student)                             │ │
│  │  │    Logic:                                                                │ │
│  │  │    1. Get previous school day (skip weekends: -3 days)                   │ │
│  │  │    2. Check if student was 'absent' yesterday                           │ │
│  │  │    3. If absent, check for approved AdmissionSlip for that date         │ │
│  │  │    4. If no approved slip → QrScanDeniedException('admission_slip_      │ │
│  │  │       required', 403)                                                   │ │
│  │  │                                                                          │ │
│  │  │  - If all checks pass → PROCESS TIME IN                                 │ │
│  │  │    → processTimeIn($student, $today, ...)                                │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  processTimeIn() ─── RECORD TIME IN                                           │
│  │                                                                               │
│  │  1. CLASSIFY STATUS:                                                          │
│  │     - Get schedule for today (day_of_week match)                              │
│  │     - If no schedule → status = 'present'                                    │
│  │     - Calculate: scheduled_start + grace_minutes vs current time             │
│  │     - If current > scheduled + grace → status = 'late'                       │
│  │     - Else → status = 'present'                                              │
│  │                                                                               │
│  │  2. RESTORE SOFT-DELETED RECORD (if re-taking):                              │
│  │     - Update: status, time_in, time_out=null, recorded_by=null                │
│  │     - metadata: ip_address, user_agent                                        │
│  │     - restore() the record                                                    │
│  │     - OR create new AttendanceRecord                                          │
│  │                                                                               │
│  │  3. CREATE ATTENDANCE RECORD:                                                │
│  │     AttendanceRecord::create([                                                │
│  │       student_id, date: today,                                               │
│  │       status: classified_status,                                             │
│  │       time_in: now()->format('H:i:s'),                                       │
│  │       source: 'scan',                                                         │
│  │       metadata: {ip_address, user_agent},                                    │
│  │     ])                                                                        │
│  │                                                                               │
│  │  4. AUDIT LOG:                                                                │
│  │     LogAuditEvent::handle(                                                    │
│  │       event: 'attendance.scan',                                               │
│  │       auditable: $record,                                                     │
│  │       actor: $student->user,                                                  │
│  │       newValues: {status, time_in, student_id},                              │
│  │       ip, userAgent                                                           │
│  │     )                                                                          │
│  │                                                                               │
│  │  5. GUARDIAN NOTIFICATION:                                                    │
│  │     → notifyGuardian($student, $record, $status)                             │
│  │     (See Section 8 for full notification flow)                                │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  processTimeOut() ─── RECORD TIME OUT                                         │
│  │                                                                               │
│  │  1. UPDATE EXISTING RECORD:                                                   │
│  │     - Set time_out: now()->format('H:i:s')                                   │
│  │     - Add metadata: time_out_ip, time_out_user_agent                         │
│  │                                                                               │
│  │  2. AUDIT LOG:                                                                │
│  │     LogAuditEvent::handle(                                                    │
│  │       event: 'attendance.time_out',                                           │
│  │       auditable: $existing,                                                   │
│  │       actor: $student->user,                                                  │
│  │       oldValues: {time_out: null},                                           │
│  │       newValues: {time_out, student_id},                                     │
│  │       ip, userAgent                                                           │
│  │     )                                                                          │
│  │                                                                               │
│  │  3. GUARDIAN NOTIFICATION:                                                    │
│  │     → notifyGuardian($student, $record, 'time_out')                          │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────┐                                          │
│  │  JSON RESPONSE (scan success):        │  {                                        │
│  │  - success: true                     │    success: true,                         │
│  │  - action: 'time_in' | 'time_out'   │    action: 'time_in',                     │
│  │  - message: descriptive text         │    message: "Student present. Time in...",│
│  │  - student: loaded with section     │    student: {...},                        │
│  │  - record: full attendance record   │    record: {...}                          │
│  │                                     │  }                                        │
│  └───────────────────────────────────────┘                                          │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  DENIED RESPONSE (QrScanDeniedException)                                     │
│  │  Status codes by reason:                                                     │
│  │  - invalid_qr → 404 Not Found                                               │
│  │  - inactive, admission_slip_required → 403 Forbidden                         │
│  │  - already_scanned, already_timed_in, not_timed_in → 409 Conflict            │
│  │  Response includes: success: false, message, optional student info           │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  GUARD CAN DELETE/RETAKE SCAN: DELETE /guard/scan/{record}                   │
│  │  - Only today's scan-sourced records can be removed                          │
│  │  - Soft-deleted record can be re-used for new scan (restoration logic)       │
│  │  - Audit logged as 'attendance.removed'                                      │
│  └─────────────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 MANUAL ATTENDANCE ENTRY (Teacher / Admin)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      MANUAL ATTENDANCE ENTRY FLOW                               │
│                                                                                  │
│  ┌──────────────┐                                                                   │
│  │   Actor      │  Teacher (assigned sections) / Admin / Super Admin              │
│  └──────┬───────┘                                                                   │
│         │                                                                           │
│         ▼                                                                           │
│  ┌─────────────────────────────┐                                                    │
│  │  GET /attendance            │  Route: attendance.index                            │
│  │  - List attendance records  │  - Authorize: viewAny, AttendanceRecord              │
│  │  - Filter by date, section, │  - Date default: today                              │
│  │    status                   │  - Teacher: filter to assigned sections             │
│  │  - Paginate                 │                                                    │
│  └──────────────┬──────────────┘                                                    │
│                 │                                                                   │
│                 ▼                                                                   │
│  ┌───────────────────────────────────────┐                                          │
│  │  Inertia: Attendance/Index.jsx        │  UI with filters                         │
│  └───────────────────────────────────────┘                                          │
│                      │                                                               │
│                      ▼ (Teacher clicks "Manual Entry")                               │
│  ┌─────────────────────────────┐                                                    │
│  │  POST /attendance/manual    │  Route: attendance.manual                            │
│  │  ManualAttendanceRequest:  │  Rules:                                            │
│  │  - student_id: required     │  - student_id: exists                              │
│  │  - date: required           │  - date: date                                      │
│  │  - status: present|late|   │  - status: in: present, late, absent               │
│  │    absent                   │  - time_out: nullable, date                        │
│  └──────────────┬──────────────┘                                                    │
│                 │                                                                   │
│                 ▼                                                                   │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  AttendanceController::manualEntry()                                          │
│  │  - Call RecordManualAttendance::handle($user, $validated, $ip, $userAgent)   │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  RecordManualAttendance::handle()                                             │
│  │                                                                               │
│  │  1. FIND STUDENT: Student::findOrFail($data['student_id'])                   │
│  │                                                                               │
│  │  2. TEACHER SECTION CHECK:                                                    │
│  │     - If actor->role === 'teacher'                                           │
│  │     - Check: actor->assignedSections()->where('sections.id', student->section_id) │
│  │     - If not found → abort(403, "You can only record attendance for students...") │
│  │                                                                               │
│  │  3. CHECK FOR EXISTING RECORD:                                                │
│  │     - AttendanceRecord::where(student_id, date)->first()                     │
│  │                                                                               │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  │  BRANCH: EXISTING RECORD FOUND                                         │ │
│  │  │  - Update: status, source='manual', recorded_by=actor->id               │ │
│  │  │  - If time_out in data, also update time_out                            │ │
│  │  │  - Audit: 'attendance.updated'                                         │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │
│  │                                                                               │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  │  BRANCH: NO EXISTING RECORD                                             │ │
│  │  │  - Create: student_id, date, status, source='manual', recorded_by       │ │
│  │  │  - time_in: now()->format('H:i:s') (auto-set on manual entry)           │ │
│  │  │  - Audit: 'attendance.manual_entry'                                    │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────┐                                          │
│  │  Redirect back with success          │  "Attendance recorded successfully."       │
│  └───────────────────────────────────────┘                                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 ATTENDANCE EXPORT (CSV Download)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ATTENDANCE EXPORT FLOW                                  │
│                                                                                  │
│  ┌──────────────┐                                                                   │
│  │  GET /attendance/export      │  Route: attendance.export                            │
│  │  - Authorize: viewAny, AttendanceRecord                                           │
│  │  - Query params: start_date, end_date, section_id                               │
│  │  - Defaults: start=month start, end=today                                       │
│  └──────────────┬──────────────┘                                                    │
│                 │                                                                   │
│                 ▼                                                                   │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  AttendanceController::export()                                               │
│  │  - Call ExportAttendanceCsv::handle($user, $startDate, $endDate, $sectionId) │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  ExportAttendanceCsv::handle()                                               │
│  │  - Teacher: filter to assigned sections                                       │
│  │  - Build CSV with headers: Date, Student, LRN, Section, Status, Time In,     │
│  │    Time Out, Source, Recorded By                                              │
│  │  - Return response with Content-Type: text/csv                                │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────┐                                          │
│  │  Browser downloads:                  │  attendance_export_{start}_{end}.csv        │
│  └───────────────────────────────────────┘                                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. ADMISSION SLIP FLOW

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ADMISSION SLIP FLOW                                     │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  CREATION (Student / Parent / Admin)                                         │
│  │  ┌─────────────────────────────┐                                                │
│  │  │  GET /admission-slips/create│  Route: admission-slips.create                      │
│  │  │  - Authorize: create, AdmissionSlip                                      │
│  │  │  - Inertia: AdmissionSlips/Create.jsx                                    │
│  │  │  - Props: student (from auth()->user()->student)                         │
│  │  └──────────────┬──────────────┘                                                │
│  │                 │                                                               │
│  │                 ▼ (User fills form)                                              │
│  │  ┌─────────────────────────────┐                                                │
│  │  │  POST /admission-slips     │  StoreAdmissionSlipRequest:                        │
│  │  │  - absence_date: required  │  - absence_date: required, date                    │
│  │  │  - reason: required        │  - reason: required, string                       │
│  │  │  - attachment: nullable    │  - attachment: nullable, file                     │
│  │  │  RateLimiter: 3 per 5 min  │  (prevents abuse)                                 │
│  │  └──────────────┬──────────────┘                                                │
│  │                 │                                                               │
│  │                 ▼                                                               │
│  │  ┌───────────────────────────────────────────────────────────────────────────┐
│  │  │  AdmissionSlipController::store()                                          │
│  │  │  - RateLimiter check (admission-slip:{userId})                            │
│  │  │  - Call CreateAdmissionSlip::handle($user, $data, $attachment, ...)      │
│  │  └───────────────────────────────────────────────────────────────────────────┘
│  │                      │                                                           │
│  │                      ▼                                                           │
│  │  ┌───────────────────────────────────────────────────────────────────────────┐
│  │  │  CreateAdmissionSlip::handle()                                             │
│  │  │  - Store attachment to 'private' disk (if uploaded)                       │
│  │  │  - Create AdmissionSlip: student_id, absence_date, reason, status='pending', │
│  │  │    notes, attachment_path, ip, userAgent                                   │
│  │  │  - Audit: 'admission_slip.created'                                        │
│  │  └───────────────────────────────────────────────────────────────────────────┘
│  │                      │                                                           │
│  │                      ▼                                                           │
│  │  ┌───────────────────────────────────────┐                                      │
│  │  │  Redirect: admission-slips.show        │  "Admission slip submitted..."          │
│  │  └───────────────────────────────────────┘                                      │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  APPROVAL (Admin / Super Admin)                                              │
│  │  ┌─────────────────────────────┐                                                │
│  │  │  POST /admission-slips/{slip}/approve│  ReviewAdmissionSlipRequest:            │
│  │  │  - review_notes: nullable  │  (optional notes from reviewer)                   │
│  │  │  - Call ApproveAdmissionSlip::handle()                                    │
│  │  │  - Status → 'approved'                                                    │
│  │  │  - reviewed_by = actor->id, reviewed_at = now()                           │
│  │  │  - Audit: 'admission_slip.approved'                                      │
│  │  └───────────────────────────────────────────────────────────────────────────┘
│  │                                                                                  │
│  │  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │  │  REJECTION (Admin / Super Admin)                                          │ │
│  │  │  POST /admission-slips/{slip}/reject                                     │ │
│  │  │  - ReviewAdmissionSlipRequest: review_notes REQUIRED                      │ │
│  │  │  - Call RejectAdmissionSlip::handle()                                     │ │
│  │  │  - Status → 'rejected'                                                    │ │
│  │  │  - rejection_reason set                                                   │ │
│  │  │  - Audit: 'admission_slip.rejected'                                      │ │
│  │  └───────────────────────────────────────────────────────────────────────────┘ │
│  └─────────────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. DASHBOARD FLOW

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD FLOW                                          │
│                                                                                  │
│  ┌──────────────┐                                                                   │
│  │  GET /dashboard              │  Route: dashboard                                   │
│  │  Middleware: auth, verified, active, force-password-change                    │
│  └──────────────┬──────────────┘                                                    │
│                 │                                                                   │
│                 ▼                                                                   │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  DashboardController::index()                                                 │
│  │  - Call BuildDashboard::handle($user)                                          │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  BuildDashboard::handle() ─── ROLE-BASED DASHBOARD DATA                       │
│  │                                                                               │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  │  SUPER ADMIN / ADMIN:                                                   │ │
│  │  │  - Total students count                                                 │ │
│  │  │  - Present today count                                                  │ │
│  │  │  - Late today count                                                     │ │
│  │  │  - Absent today count                                                   │ │
│  │  │  - Recent attendance (last 10)                                         │ │
│  │  │  - Recent scans (last 10)                                              │ │
│  │  │  - Section stats                                                        │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │
│  │                                                                               │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  │  TEACHER:                                                               │ │
│  │  │  - Same stats but filtered to assigned sections                          │ │
│  │  │  - Recent attendance for assigned sections only                         │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │
│  │                                                                               │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  │  SECURITY GUARD:                                                       │ │
│  │  │  - Today's attendance stats                                             │ │
│  │  │  - Recent scans (last 20, with student details)                         │ │
│  │  │  - Guard schedule for today                                              │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │
│  │                                                                               │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  │  STUDENT:                                                               │ │
│  │  │  - Personal QR code (for display/scanning)                              │ │
│  │  │  - Own attendance history                                               │ │
│  │  │  - Own admission slip status                                            │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────┐                                          │
│  │  Inertia: Dashboard.jsx               │  Auto-refresh every 5 seconds (staff/guard) │
│  │  Props:                               │  (router.reload with partial data)       │
│  │  - stats, recent_attendance, etc.    │                                          │
│  │  - user (id, name, email, role)      │                                          │
│  └───────────────────────────────────────┘                                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. GUARDIAN NOTIFICATION FLOW

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      GUARDIAN NOTIFICATION FLOW                                 │
│                                                                                  │
│  Triggered by: ProcessQrScan::notifyGuardian() (on time_in AND time_out)       │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  notifyGuardian(Student $student, AttendanceRecord $record, string $status)  │
│  │                                                                               │
│  │  1. CHECK GUARDIAN EMAIL:                                                     │
│  │     - If !$student->guardian_email → return (no notification)                │
│  │                                                                               │
│  │  2. BUILD NOTIFICATION CONTENT:                                               │
│  │     - Action: 'time_in' or 'time_out'                                        │
│  │     - Date: now()->format('F j, Y')                                          │
│  │     - Time: now()->format('h:i A')                                           │
│  │     - Status label: 'Checked out' or ucfirst($record->status)                │
│  │     - Subject: "Attendance Notification — {student name} has {arrived/left}"│
│  │     - Body: "Your child {name} has {arrived/left} the school premises at..." │
│  │                                                                               │
│  │  3. CREATE NOTIFICATION RECORD:                                               │
│  │     GuardianNotification::create([                                            │
│  │       student_id, attendance_record_id, guardian_email,                       │
│  │       subject, body, status: 'pending'                                        │
│  │     ])                                                                        │
│  │                                                                               │
│  │  4. SEND EMAIL (SYNCHRONOUS):                                                 │
│  │     try {                                                                     │
│  │       Mail::to($student->guardian_email)->send(                               │
│  │         new GuardianAttendanceNotification(...)                                │
│  │       );                                                                      │
│  │       - Update notification status → 'sent', sent_at = now()                 │
│  │     } catch (Exception $e) {                                                  │
│  │       - Update notification status → 'failed', failure_reason = $e->getMessage()│
│  │     }                                                                         │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  Notification Status Lifecycle:                                              │
│  │  pending → sent (success)                                                    │
│  │  pending → failed (email error)                                              │
│  └─────────────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. AI ASSISTANT FLOW

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AI ASSISTANT FLOW                                       │
│                                                                                  │
│  ┌──────────────┐                                                                   │
│  │  Actors      │  Super Admin, Admin, Teacher (role:super_admin,admin,teacher)  │
│  └──────┬───────┘                                                                   │
│         │                                                                           │
│         ▼                                                                           │
│  ┌─────────────────────────────┐                                                    │
│  │  GET /ai                    │  Route: ai.index                                    │
│  │  Middleware:                │  - auth                                          │
│  │  - role:super_admin,admin, │  - role:super_admin,admin,teacher                   │
│  │    teacher                  │                                                    │
│  └──────────────┬──────────────┘                                                    │
│                 │                                                                   │
│                 ▼                                                                   │
│  ┌───────────────────────────────────────┐                                          │
│  │  Inertia: Ai/Index.jsx                │  Chat interface UI                  │
│  └───────────────────────────────────────┘                                          │
│                      │                                                               │
│                      ▼ (User types question + submits)                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  POST /ai/query                                                               │
│  │  Route: ai.query                                                              │
│  │  Middleware:                                                                  │
│  │  - auth                                                                       │
│  │  - role:super_admin,admin,teacher                                             │
│  │  - throttle:20,1 (20 requests/minute - AI API cost protection)               │
│  │  AiQueryRequest Validation:                                                   │
│  │  - question: required, max:2000                                               │
│  │  - start_date: nullable, date                                                 │
│  │  - end_date: nullable, date                                                   │
│  │  - section_id: nullable, exists                                               │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  AiController::query()                                                        │
│  │  - Call QueryAssistant::handle($user, $question, $startDate, $endDate,       │
│  │    $sectionId, $ip, $userAgent)                                               │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  QueryAssistant::handle()                                                     │
│  │                                                                               │
│  │  1. GET AI PROVIDER CONFIG:                                                   │
│  │     - config('ai.provider'): 'gemini' | 'openrouter' | null                  │
│  │     - Get API key from config                                                 │
│  │     - If no API key → ValidationException ("AI assistance is not configured")│
│  │                                                                               │
│  │  2. BUILD CONTEXT (for AI prompt):                                            │
│  │     → BuildAiContext::handle($user, $startDate, $endDate, $sectionId)        │
│  │                                                                               │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  │  BuildAiContext::handle() — DATA GATHERING                               │ │
│  │  │                                                                          │ │
│  │  │  Role-based access control in EVERY query:                              │ │
│  │  │                                                                          │ │
│  │  │  SUPER ADMIN:                                                           │ │
│  │  │  - sections (all, with student_count, teachers)                          │ │
│  │  │  - teachers (all)                                                       │ │
│  │  │  - students (up to 100, all)                                            │ │
│  │  │  - attendance_summary (full period)                                     │ │
│  │  │  - attendance_by_section                                                │ │
│  │  │  - late_students (top 20)                                               │ │
│  │  │  - absent_students (top 20)                                             │ │
│  │  │  - early_arrivals (top 20)                                              │ │
│  │  │  - users (ALL users including super_admin)                              │ │
│  │  │  - audit_recent (last 20 audit logs)                                    │ │
│  │  │                                                                          │ │
│  │  │  ADMIN:                                                                 │ │
│  │  │  - Same as super admin EXCEPT: no users list, no audit logs             │ │
│  │  │                                                                          │ │
│  │  │  TEACHER:                                                               │ │
│  │  │  - sections (assigned only)                                             │ │
│  │  │  - teachers (self only)                                                 │ │
│  │  │  - students (assigned sections only, up to 100)                         │ │
│  │  │  - attendance_summary (assigned sections only)                          │ │
│  │  │  - attendance_by_section (assigned only)                                │ │
│  │  │  - late_students (assigned only)                                        │ │
│  │  │  - absent_students (assigned only)                                      │ │
│  │  │  - early_arrivals (assigned only)                                      │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │
│  │                                                                               │
│  │  3. BUILD PROMPT:                                                             │
│  │     - System prompt (role-specific access rules)                              │
│  │     - + SCHOOL DATA (JSON from BuildAiContext)                               │
│  │     - + QUESTION                                                              │
│  │                                                                               │
│  │  4. CALL AI PROVIDER:                                                         │
│  │     - Gemini: POST to generativelanguage.googleapis.com                       │
│  │     - OpenRouter: POST to openrouter.ai/api/v1/chat/completions               │
│  │     - Model, max_tokens, temperature=0.3 from config                         │
│  │                                                                               │
│  │  5. HANDLE RESPONSE:                                                          │
│  │     - Extract answer text from response                                       │
│  │     - If empty/failed → ValidationException                                  │
│  │                                                                               │
│  │  6. AUDIT LOG:                                                                │
│  │     LogAuditEvent::handle(                                                    │
│  │       event: 'ai.query',                                                      │
│  │       newValues: {question, answer, provider, model, period, section_id},   │
│  │       ip, userAgent                                                           │
│  │     )                                                                          │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────┐                                          │
│  │  JSON RESPONSE:                      │  { "answer": "..." }                     │
│  └───────────────────────────────────────┘                                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. ANALYTICS FLOW

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ANALYTICS FLOW                                          │
│                                                                                  │
│  ┌──────────────┐                                                                   │
│  │  GET /analytics              │  Route: analytics.index                             │
│  │  Middleware: auth            │                                                    │
│  └──────────────┬──────────────┘                                                    │
│                 │                                                                   │
│                 ▼                                                                   │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  AnalyticsController::index()                                                 │
│  │  - Default date range: start of month → today                                 │
│  │  - Call BuildAnalyticsReport::handle($user, $startDate, $endDate, $sectionId)│
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐
│  │  BuildAnalyticsReport::handle()                                               │
│  │                                                                               │
│  │  Returns:                                                                     │
│  │  - stats: {total_records, present, late, absent}                            │
│  │  - sectionRanking: [{id, section.name, total, late_count}] (by late_count desc)│
│  │  - lateStudents: top 10 students by late count                                │
│  │  - earlyArrivals: top 10 students by earliest time_in                         │
│  │  - absenteeism: top 10 students by absent count                               │
│  │                                                                               │
│  │  Teacher filtering: all queries filter to assigned sections                   │
│  └───────────────────────────────────────────────────────────────────────────────┘
│                      │                                                               │
│                      ▼                                                               │
│  ┌───────────────────────────────────────┐                                          │
│  │  Inertia: Analytics page              │  Date range selector, section filter       │
│  │  Props: stats, sectionRanking, etc.  │                                          │
│  └───────────────────────────────────────┘                                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. USER MANAGEMENT FLOW (Super Admin / Admin)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         USER MANAGEMENT FLOW                                    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  USER CRUD                                                                    │
│  │  - GET/POST /users (users.index, users.store)                                 │
│  │  - GET /users/{user} (users.show)                                            │
│  │  - GET /users/{user}/edit (users.edit)                                       │
│  │  - PATCH /users/{user} (users.update)                                        │
│  │  - DELETE /users/{user} (users.destroy)                                      │
│  │  - POST /users/{user}/toggle-active (users.toggle-active)                    │
│  │  - POST /users/{user}/reset-password (users.reset-password)                  │
│  │  - POST /users/{user}/force-password-change                                  │
│  │  - POST /users/{user}/restore (users.restore)                                │
│  │                                                                              │
│  │  Middleware: role:super_admin,admin (all routes)                             │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  TEACHER MANAGEMENT                                                            │
│  │  - GET /teachers (teachers.index) - list all teachers                        │
│  │  - POST /teachers/assign - assign teacher to section                         │
│  │  - POST /teachers/remove - remove teacher from section                       │
│  │  Creates TeacherSectionAssignment record: user_id, section_id, academic_year_id│
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  SECTION MANAGEMENT (Super Admin / Admin)                                    │
│  │  - Full CRUD for sections                                                    │
│  │  - Assign/remove teachers to sections                                       │
│  │  - Section schedules (day_of_week, start_time, end_time, grace_minutes)      │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  ACADEMIC YEAR & GRADE LEVEL MANAGEMENT (Super Admin / Admin)                │
│  │  - Full CRUD for academic_years                                              │
│  │  - Full CRUD for grade_levels (Grade 7-12)                                  │
│  └─────────────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. AUDIT LOGGING SYSTEM

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AUDIT LOGGING SYSTEM                                    │
│                                                                                  │
│  Triggered by: LogAuditEvent::handle() in various actions                       │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  AUDITED EVENTS:                                                              │
│  │  - attendance.scan (QR code time_in)                                          │
│  │  - attendance.time_out (QR code time_out)                                     │
│  │  - attendance.manual_entry (manual record)                                    │
│  │  - attendance.updated (manual update to existing)                            │
│  │  - attendance.removed (guard delete/retake)                                  │
│  │  - admission_slip.created                                                    │
│  │  - admission_slip.approved                                                   │
│  │  - admission_slip.rejected                                                   │
│  │  - ai.query (AI assistant queries)                                           │
│  │  - All user CRUD operations                                                  │
│  │  - Student CRUD operations                                                   │
│  │  - Section CRUD operations                                                   │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  AuditLog Model Fields:                                                       │
│  │  - id, event, auditable_type, auditable_id                                   │
│  │  - actor_type, actor_id                                                      │
│  │  - old_values (JSON), new_values (JSON)                                      │
│  │  - ip_address, user_agent                                                    │
│  │  - created_at, updated_at                                                    │
│  │                                                                              │
│  │  Visible to: Super Admin, Admin (read-only)                                 │
│  │  Routes: /audit-logs, /audit-logs/{auditLog}                                 │
│  └─────────────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. COMPLETE DATA MODEL RELATIONSHIPS

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ENTITY RELATIONSHIP DIAGRAM                             │
│                                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐        │
│  │      USER        │     │     STUDENT      │     │     SECTION      │        │
│  │                  │     │                  │     │                  │        │
│  │ - id (PK)        │◀─── │ - id (PK)        │     │ - id (PK)        │        │
│  │ - name           │     │ - user_id (FK)──▶│     │ - name           │        │
│  │ - email          │     │ - lrn            │     │ - grade_level_id │───▶    │
│  │ - password       │     │ - first_name     │     │ - academic_year_id│───▶   │
│  │ - role           │     │ - last_name      │     │                  │        │
│  │ - phone          │     │ - middle_name    │     │ ┌──────────────┐ │        │
│  │ - is_active      │     │ - section_id     │───▶│ │ GRADE LEVEL  │ │        │
│  │ - force_password │     │ - photo_path     │     │ │              │ │        │
│  │ - email_verified │     │ - guardian_name  │     │ │ - id (PK)    │ │        │
│  │                  │     │ - guardian_email │     │ │ - name       │ │        │
│  │ ┌──────────────┐ │     │ - qr_token       │     │ │ - level_number│        │
│  │ │ STUDENT     │ │     │ - is_active      │     │ └──────────────┘ │        │
│  │ │ (hasOne)    │ │     └──────────────────┘     └──────────────────┘        │
│  │ └──────────────┘ │           │                                         │        │
│  │                  │           │                                         │        │
│  │ ┌──────────────┐ │           ▼                                         │        │
│  │ │ TEACHER     │ │     ┌──────────────────┐                                │        │
│  │ │ (hasMany)   │ │     │ ATTENDANCE_RECORD│                                │        │
│  │ │ assignments │ │     │                  │                                │        │
│  │ └──────────────┘ │     │ - id (PK)        │                                │        │
│  │                  │     │ - student_id (FK)│───▶                            │        │
│  │ ┌──────────────┐ │     │ - section_id (FK)│───▶                            │        │
│  │ │ ASSIGNED    │ │     │ - date           │     ┌──────────────────┐        │
│  │ │ SECTIONS    │ │     │ - status         │     │ ADMISSION_SLIP   │        │
│  │ │ (belongsTo  │ │     │ - time_in        │     │                  │        │
│  │ │ many)       │ │     │ - time_out       │     │ - id (PK)        │        │
│  │ └──────────────┘ │     │ - source         │     │ - student_id (FK)│───▶    │
│  │                  │     │ - recorded_by    │     │ - absence_date   │        │
│  │                  │     │ - metadata (JSON)│     │ - reason         │        │
│  │                  │     └──────────────────┘     │ - status         │        │
│  │                  │                              │ - notes          │        │
│  │                  │                              │ - attachment_path│        │
│  │                  │                              │ - reviewed_by    │        │
│  │                  │                              │ - reviewed_at    │        │
│  │                  │                              │ - rejection_reason│       │
│  │                  │                              └──────────────────┘        │
│  │                  │                                      │                    │
│  │                  │                                      ▼                    │
│  │                  │                              ┌──────────────────┐        │
│  │                  │                              │ GUARDIAN_NOTIF.  │        │
│  │                  │                              │                  │        │
│  │                  │                              │ - id (PK)        │        │
│  │                  │                              │ - student_id (FK)│───▶    │
│  │                  │                              │ - attendance_rec.│───▶    │
│  │                  │                              │ - guardian_email │        │
│  │                  │                              │ - subject        │        │
│  │                  │                              │ - body           │        │
│  │                  │                              │ - status         │        │
│  │                  │                              │ - sent_at        │        │
│  │                  │                              │ - failure_reason │        │
│  │                  │                              └──────────────────┘        │
│  │                  │                                                            │
│  │                  │                                                            │
│  │                  │ ┌────────────────────────────────────────────────────────┐ │
│  │                  │ │ AUXILIARY TABLES                                       │ │
│  │                  │ │                                                        │ │
│  │                  │ │ TEACHER_SECTION_ASSIGNMENT                             │ │
│  │                  │ │ - id, user_id (FK)→User, section_id (FK)→Section,     │ │
│  │                  │ │   academic_year_id (FK)→AcademicYear                   │ │
│  │                  │ │                                                        │ │
│  │                  │ │ SECTION_SCHEDULE                                       │ │
│  │                  │ │ - id, section_id (FK)→Section, day_of_week,            │ │
│  │                  │ │   start_time, end_time, grace_minutes                  │ │
│  │                  │ │                                                        │ │
│  │                  │ │ GUARD_SCHEDULE                                          │ │
│  │                  │ │ - id, guard_id (FK)→User(security_guard),             │ │
│  │                  │ │   section_id (FK)→Section, day_of_week,                │ │
│  │                  │ │   start_time, end_time                                 │ │
│  │                  │ │                                                        │ │
│  │                  │ │ AUDIT_LOG                                               │ │
│  │                  │ │ - id, event, auditable_type, auditable_id,             │ │
│  │                  │ │   actor_type, actor_id, old_values (JSON),             │ │
│  │                  │ │   new_values (JSON), ip_address, user_agent            │ │
│  │                  │ └────────────────────────────────────────────────────────┘ │
│  └──────────────────┘                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 14. FLOWCHART SUMMARY - ALL ACTORS AND KEY FLOWS

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SYSTEM FLOW SUMMARY                                     │
│                                                                                  │
│  FLOW 1: AUTHENTICATION                                                          │
│  ├── Guest → Login/Register/Google OAuth                                        │
│  ├── AuthenticatedSessionController → Session creation                           │
│  ├── Middleware chain: auth → verified → active → force-password-change          │
│  └── Role-based route access control                                             │
│                                                                                  │
│  FLOW 2: STUDENT MANAGEMENT (Super Admin / Admin / Teacher)                     │
│  ├── Create: Form → StoreStudentRequest → CreateStudent → User + Student         │
│  ├── Read: Index (search/filter/paginate) → Show (with QR)                       │
│  ├── Update: Edit form → UpdateStudent                                           │
│  ├── Delete: Soft delete                                                        │
│  ├── Import: CSV/XLSX upload → ImportStudentsFromCsv → CreateStudent (batch)    │
│  └── QR Printing: Single QR / Bulk QR print pages                               │
│                                                                                  │
│  FLOW 3: ATTENDANCE - QR SCAN (Security Guard)                                  │
│  ├── Guard opens /guard/scan with schedule + recent scans                       │
│  ├── Enters QR token or LRN + selects mode (Auto/Time In/Time Out)              │
│  ├── ProcessQrScan: Find student → Check active → Check existing record         │
│  ├── Time In: Classify status (present/late) → Create record → Audit → Notify   │
│  ├── Time Out: Update existing record → Audit → Notify                           │
│  ├── Guards can delete/retake today's scans                                      │
│  └── Admission slip check: If absent yesterday, need approved slip              │
│                                                                                  │
│  FLOW 4: ATTENDANCE - MANUAL ENTRY (Teacher / Admin)                            │
│  ├── Teacher: Manual entry form → section check → RecordManualAttendance         │
│  ├── Admin: Full access to all students                                          │
│  └── Audit logged for every manual entry                                        │
│                                                                                  │
│  FLOW 5: ADMISSION SLIPS                                                        │
│  ├── Student creates slip for absence (rate limited: 3 per 5 min)               │
│  ├── Admin reviews: Approve (status=approved) or Reject (with notes)            │
│  └── Required for QR scan if student was absent previous school day             │
│                                                                                  │
│  FLOW 6: GUARDIAN NOTIFICATIONS                                                  │
│  ├── Triggered on every time_in and time_out                                    │
│  ├── If student.guardian_email exists → Create GuardianNotification             │
│  ├── Send email synchronously (GuardianAttendanceNotification)                  │
│  ├── Status: pending → sent (success) or failed (error logged)                  │
│  └── Visible to Super Admin / Admin for monitoring                              │
│                                                                                  │
│  FLOW 7: AI ASSISTANT                                                           │
│  ├── Super Admin / Admin / Teacher access (throttled: 20/min)                   │
│  ├── Question → BuildAiContext (role-filtered data) → AI Provider API call      │
│  ├── Gemini or OpenRouter integration                                           │
│  ├── Response returned with audit logging                                        │
│  └── Teacher context limited to assigned sections only                          │
│                                                                                  │
│  FLOW 8: ANALYTICS & DASHBOARD                                                  │
│  ├── Dashboard: Role-based stats (students, attendance today, recent activity)   │
│  ├── Analytics: Date range report with stats, section ranking, top students      │
│  └── Teacher data filtered to assigned sections                                 │
│                                                                                  │
│  FLOW 9: USER & ADMINISTRATIVE MANAGEMENT                                       │
│  ├── User CRUD (Super Admin / Admin)                                            │
│  ├── Teacher assignment to sections                                             │
│  ├── Section CRUD with schedules                                                │
│  ├── Academic year / grade level management                                     │
│  └── Audit logs (read-only for Super Admin / Admin)                             │
│                                                                                  │
│  FLOW 10: SECURITY & EDGE CASES                                                 │
│  ├── Unauthenticated → Redirect to login                                        │
│  ├── Inactive user → 403 Forbidden                                              │
│  ├── Teacher section boundary enforcement (students, attendance, AI)            │
│  ├── QR scan validations: invalid, inactive, already scanned, admission slip    │
│  ├── Rate limiting: login (5/min), guard scan (60/min), AI (20/min), import (10/min)│
│  └── Soft delete for attendance records (allows re-take by guard)               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. VISUAL FLOWCHART (ASCII)

```
                          ┌─────────────────────────────────────────┐
                          │           MNHS ATTENDANCE SYSTEM         │
                          └──────────────────┬──────────────────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
              ▼                              ▼                              ▼
    ┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
    │   AUTH FLOW      │          │  STUDENT MGMT    │          │  ATTENDANCE      │
    │                  │          │                  │          │                  │
    │  Guest ──▶ Login │          │  Super Admin ──▶│          │  Security Guard  │
    │         Register │          │  Admin ──▶      │          │  ──▶ QR Scan     │
    │         Google   │          │  Teacher ──▶    │          │     (time_in/    │
    │         OAuth    │          │  (assigned secs)│          │      time_out)   │
    │                  │          │                  │          │                  │
    │  ▼ Session       │          │  Create Student  │          │  ▼ ProcessQrScan │
    │  ▼ Middleware    │          │  Import CSV/XLSX │          │  Check student   │
    │  ▼ Role access   │          │  CRUD operations │          │  Active?         │
    └────────┬─────────┘          │  QR printing     │          │  Existing record?│
             │                    └────────┬─────────┘          │  Admission slip? │
             │                             │                    └────────┬─────────┘
             │                             │                             │
             ▼                             ▼                             ▼
    ┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
    │  Dashboard       │          │  Guardian        │          │  Manual Entry    │
    │  (role-based)    │          │  Notifications   │          │  (Teacher/Admin) │
    │                  │          │  (email on       │          │                  │
    │  Stats           │          │   time_in/out)   │          │  Section check   │
    │  Recent activity │          │                  │          │  Create/Update   │
    │  Auto-refresh    │          │  pending → sent  │          │  Audit logged    │
    └────────┬─────────┘          └────────┬─────────┘          └────────┬─────────┘
             │                             │                             │
             │                             │                             │
             ▼                             ▼                             ▼
    ┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
    │  AI Assistant    │          │  Analytics       │          │  Admin Functions │
    │  (Super Admin/   │          │  (reports)       │          │  (Super Admin/   │
    │   Admin/Teacher) │          │                  │          │   Admin)         │
    │                  │          │  Date range      │          │                  │
    │  Question →      │          │  Section ranking │          │  User CRUD       │
    │  BuildContext    │          │  Late students   │          │  Teacher assign  │
    │  AI API call     │          │  Absent students │          │  Section CRUD    │
    │  Response + log  │          │  Early arrivals  │          │  Grade levels    │
    └────────┬─────────┘          └────────┬─────────┘          │  Audit logs      │
             │                             │                     └────────┬─────────┘
             │                             │                              │
             └─────────────────────────────┼──────────────────────────────┘
                                           │
                                           ▼
                              ┌──────────────────────────┐
                              │    DATABASE (MySQL)       │
                              │                          │
                              │  Users, Students,        │
                              │  Sections, Attendance,   │
                              │  Admission Slips,        │
                              │  Notifications, Audit,   │
                              │  Schedules, etc.         │
                              └──────────────────────────┘
```

---

## 16. TEST COVERAGE MAP

Based on `tests/Feature/` directory, the following flows are tested:

| Test File | Flows Covered | Tests |
|-----------|---------------|-------|
| `AiAssistantTest.php` | AI Assistant (access control, query, error handling, audit logging) | 6 |
| `AttendanceSystemPagesTest.php` | Attendance pages, guard scan, manual entry, admission slips | 6 |
| `CsvImportTest.php` | CSV import (success, BOM, missing columns, empty lines) | 4 |
| `AuthenticationTest.php` | Login, logout, unauthenticated redirects (17 tests) | 17 |
| `EmailVerificationTest.php` | Email verification flow | 3 |
| `PasswordConfirmationTest.php` | Password confirmation | 3 |
| `PasswordResetTest.php` | Password reset flow | 4 |
| `PasswordUpdateTest.php` | Password update | 2 |
| `RegistrationTest.php` | User registration | 2 |
| `GoogleAuthTest.php` | Google OAuth flow (9 scenarios) | 9 |
| `ProfileTest.php` | Profile management | 5 |
| `SecurityAndEdgeCasesTest.php` | Admission slip rejection, deactivated users, CSV export, teacher section isolation, teacher assignment | 11 |
| `ExampleTest.php` | Basic response test | 1 |

**TOTAL: 74 tests, 273 assertions**

---

## 17. KEY SECURITY CONTROLS

| Control | Implementation |
|---------|----------------|
| **Authentication** | Laravel Breeze (session-based), Google OAuth option |
| **Authorization** | Role-based middleware (`role:super_admin,admin,teacher`, etc.) |
| **Teacher Boundaries** | Section filtering in every query for teacher role |
| **Rate Limiting** | Login: 5/min, Guard scan: 60/min, AI: 20/min, CSV import: 10/min |
| **Admission Slip Abuse** | Rate limit: 3 submissions per 5 minutes per user |
| **Active User Check** | Middleware blocks inactive users from all protected routes |
| **Force Password Change** | Middleware enforces password change when flagged |
| **Audit Trail** | All sensitive operations logged with actor, IP, user agent, old/new values |
| **Private File Storage** | Admission slip attachments stored on private disk (not public) |
| **Student Photos** | Auth-protected endpoint with filename validation |

---

**Document End** — MNHS Attendance Monitoring System E2E Flowchart v1.0
