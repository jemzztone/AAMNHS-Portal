# MNHS Attendance System - Models, APIs & Functions Documentation

## PART 1: ELOQUENT MODELS

### 1.1 User Model
**File:** `app/Models/User.php`

**Fillable Fields:**
- name, email, password, role, phone, is_active, force_password_change, email_verified_at

**Casts:**
- is_active: boolean
- force_password_change: boolean
- email_verified_at: datetime

**Relationships:**
- student() → BelongsTo(Student)
- teacherAssignments() → HasMany(TeacherSectionAssignment)
- assignedSections() → BelongsToMany(Section) via teacher_section_assignments
- student() → HasOne(Student)

**Scopes:**
- None

**Notes:** Base model for all users with role-based access control

---

### 1.2 Student Model
**File:** `app/Models/Student.php`

**Fillable Fields:**
- user_id, lrn, first_name, last_name, middle_name, section_id, photo_path, guardian_name, guardian_email, qr_token, is_active

**Casts:**
- is_active: boolean

**Appends:**
- full_name, photo_url

**Relationships:**
- user() → BelongsTo(User)
- section() → BelongsTo(Section)
- attendanceRecords() → HasMany(AttendanceRecord)
- admissionSlips() → HasMany(AdmissionSlip)
- guardianNotifications() → HasMany(GuardianNotification)

**Scopes:**
- active() → where is_active = true
- bySection($sectionId) → where section_id = $sectionId

**Notes:** Represents students with LRN (12-digit ID) and QR token for attendance scanning

---

### 1.3 Section Model
**File:** `app/Models/Section.php`

**Fillable Fields:**
- id, name, grade_level_id, academic_year_id

**Relationships:**
- gradeLevel() → BelongsTo(GradeLevel)
- academicYear() → BelongsTo(AcademicYear)
- students() → HasMany(Student)
- teachers() → BelongsToMany(User) via teacher_section_assignments
- schedules() → HasMany(SectionSchedule)

**Scopes:**
- None

**Notes:** Represents class sections (e.g., Grade 7-A)

---

### 1.4 AcademicYear Model
**File:** `app/Models/AcademicYear.php`

**Fillable Fields:**
- id, name, start_date, end_date, is_current

**Casts:**
- is_current: boolean

**Relationships:**
- sections() → HasMany(Section)

**Notes:** Academic year container for sections

---

### 1.5 GradeLevel Model
**File:** `app/Models/GradeLevel.php`

**Fillable Fields:**
- id, name, level_number

**Relationships:**
- sections() → HasMany(Section)

**Notes:** Fixed taxonomy (Grade 7-12)

---

### 1.6 AttendanceRecord Model
**File:** `app/Models/AttendanceRecord.php`

**Fillable Fields:**
- id, student_id, section_id, date, status, time_in, source, recorded_by, time_out, metadata

**Casts:**
- metadata: array

**Relationships:**
- student() → BelongsTo(Student)
- section() → BelongsTo(Section)

**Scopes:**
- forDate($date) → where date = $date
- forSection($sectionId) → where section_id = $sectionId
- forStudent($studentId) → where student_id = $studentId

**Notes:** Core attendance tracking with time_in, time_out, status (present/late/absent)

---

### 1.7 AdmissionSlip Model
**File:** `app/Models/AdmissionSlip.php`

**Fillable Fields:**
- id, student_id, absence_date, reason, status, notes, reviewed_by, reviewed_at, rejection_reason

**Casts:**
- reviewed_at: datetime

**Relationships:**
- student() → BelongsTo(Student)

**Scopes:**
- pending() → where status = 'pending'
- approved() → where status = 'approved'
- rejected() → where status = 'rejected'
- forStudent($studentId) → where student_id = $studentId

**Notes:** Permission slip for students who were absent

---

### 1.8 GuardianNotification Model
**File:** `app/Models/GuardianNotification.php`

**Fillable Fields:**
- id, student_id, attendance_record_id, guardian_email, subject, body, status, sent_at, failure_reason

**Casts:**
- sent_at: datetime

**Relationships:**
- student() → BelongsTo(Student)
- attendanceRecord() → BelongsTo(AttendanceRecord)

**Notes:** Email notifications sent to parents/guardians

---

### 1.9 AuditLog Model
**File:** `app/Models/AuditLog.php`

**Fillable Fields:**
- id, event, auditable_type, auditable_id, actor_type, actor_id, old_values, new_values, ip_address, user_agent

**Casts:**
- old_values: array
- new_values: array
- ip_address: string
- user_agent: string

**Relationships:**
- auditable() → MorphTo
- user() → BelongsTo(User)

**Notes:** Tracks all system activities for security and accountability

---

### 1.10 SectionSchedule Model
**File:** `app/Models/SectionSchedule.php`

**Fillable Fields:**
- id, section_id, day_of_week, start_time, end_time, grace_minutes

**Relationships:**
- section() → BelongsTo(Section)

**Notes:** Class schedules per section per day

---

### 1.11 TeacherSectionAssignment Model
**File:** `app/Models/TeacherSectionAssignment.php`

**Fillable Fields:**
- id, user_id, section_id, academic_year_id

**Relationships:**
- user() → BelongsTo(User)
- section() → BelongsTo(Section)

**Notes:** Links teachers to their assigned sections

---

### 1.12 GuardSchedule Model
**File:** `app/Models/GuardSchedule.php`

**Fillable Fields:**
- id, guard_id, section_id, day_of_week, start_time, end_time

**Relationships:**
- guard() → BelongsTo(User)
- section() → BelongsTo(Section)

**Notes:** Security guard duty schedules

---

### 1.13 GuardianNotification Model (Duplicate from 1.8)
Already documented above.

---

## PART 2: CONTROLLERS

### 2.1 Authentication Controllers

#### AuthenticatedSessionController
**File:** `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
- create() → Show login form
- store() → Handle login
- destroy() → Handle logout

#### RegisteredUserController
**File:** `app/Http/Controllers/Auth/RegisteredUserController.php`
- create() → Show registration form
- store() → Handle registration

#### ConfirmablePasswordController
**File:** `app/Http/Controllers/Auth/ConfirmablePasswordController.php`
- show() → Show password confirmation form
- store() → Confirm password

#### PasswordController
**File:** `app/Http/Controllers/Auth/PasswordController.php`
- update() → Update password

#### PasswordResetLinkController
**File:** `app/Http/Controllers/Auth/PasswordResetLinkController.php`
- create() → Show reset link request form
- store() → Send reset link

#### NewPasswordController
**File:** `app/Http/Controllers/Auth/NewPasswordController.php`
- create() → Show reset password form
- store() → Handle password reset

#### EmailVerificationPromptController
**File:** `app/Http/Controllers/Auth/EmailVerificationPromptController.php`
- show() → Show email verification prompt

#### VerifyEmailController
**File:** `app/Http/Controllers/Auth/VerifyEmailController.php`
- handle() → Verify email

#### GoogleController
**File:** `app/Http/Controllers/Auth/GoogleController.php`
- redirect() → Redirect to Google OAuth
- callback() → Handle Google OAuth callback

---

### 2.2 Main Controllers

#### DashboardController
**File:** `app/Http/Controllers/DashboardController.php`
- index() → Show dashboard (role-based)

#### StudentController
**File:** `app/Http/Controllers/StudentController.php`
- index() → List students
- create() → Show create form
- store() → Create student
- show() → Show student details
- edit() → Show edit form
- update() → Update student
- destroy() → Delete student
- printQR() → Print single QR
- bulkPrintQR() → Print multiple QRs
- suggestions() → Autocomplete API
- photo() → Serve student photo

#### SectionController
**File:** `app/Http/Controllers/SectionController.php`
- index() → List sections
- create() → Show create form
- store() → Create section
- show() → Show section
- edit() → Show edit form
- update() → Update section
- destroy() → Delete section
- assignTeacher() → Assign teacher to section
- removeTeacher() → Remove teacher from section

#### AttendanceController
**File:** `app/Http/Controllers/AttendanceController.php`
- index() → List attendance
- manualEntry() → Record manual attendance
- export() → Export attendance CSV

#### CsvImportController
**File:** `app/Http/Controllers/CsvImportController.php`
- index() → Show import form
- template() → Download CSV template
- import() → Process CSV import

#### AdmissionSlipController
**File:** `app/Http/Controllers/AdmissionSlipController.php`
- index() → List slips
- create() → Show create form
- store() → Create slip
- show() → Show slip
- approve() → Approve slip
- reject() → Reject slip

#### QRScanController
**File:** `app/Http/Controllers/QRScanController.php`
- index() → Show scan page
- scan() → Process QR scan
- destroy() → Delete scan record
- recent() → List recent scans
- show() → Show schedule (guard)

#### GuardianNotificationController
**File:** `app/Http/Controllers/GuardianNotificationController.php`
- index() → List notifications
- show() → Show notification

#### AnalyticsController
**File:** `app/Http/Controllers/AnalyticsController.php`
- index() → Show analytics

#### AuditLogController
**File:** `app/Http/Controllers/AuditLogController.php`
- index() → List audit logs
- show() → Show audit log

#### AcademicYearController
**File:** `app/Http/Controllers/AcademicYearController.php`
- index() → List academic years
- create() → Show create form
- store() → Create
- show() → Show
- edit() → Show edit form
- update() → Update
- destroy() → Delete

#### GradeLevelController
**File:** `app/Http/Controllers/GradeLevelController.php`
- Same as AcademicYearController

#### SectionScheduleController
**File:** `app/Http/Controllers/SectionScheduleController.php`
- index() → List schedules
- create() → Show create form
- store() → Create
- show() → Show
- edit() → Show edit form
- update() → Update
- destroy() → Delete

#### UserController
**File:** `app/Http/Controllers/UserController.php`
- index() → List users
- create() → Show create form
- store() → Create user
- show() → Show user
- edit() → Show edit form
- update() → Update user
- destroy() → Delete user
- restore() → Restore deleted user
- toggleActive() → Toggle user active status
- resetPassword() → Reset user password
- forcePasswordChange() → Toggle force password change

#### TeacherController
**File:** `app/Http/Controllers/TeacherController.php`
- index() → List teachers
- assign() → Assign teacher
- remove() → Remove teacher

#### ProfileController
**File:** `app/Http/Controllers/ProfileController.php`
- edit() → Show profile edit
- update() → Update profile
- destroy() → Delete account

#### AiController
**File:** `app/Http/Controllers/AiController.php`
- index() → Show AI chat
- query() → Process AI query

#### GuardScheduleController
**File:** `app/Http/Controllers/GuardScheduleController.php`
- show() → Show guard schedule
- store() → Create schedule

#### TeacherSectionAssignmentController
**File:** `app/Http/Controllers/TeacherSectionAssignmentController.php`
- (May not be used directly)

#### AttendanceRecordController
**File:** `app/Http/Controllers/AttendanceRecordController.php`
- (May not be used directly)

---

## PART 3: ACTION CLASSES

### 3.1 Attendance Actions
**Location:** `app/Actions/Attendance/`

| Class | Method | Description |
|-------|--------|-------------|
| ProcessQrScan | handle() | Process QR code scan for time_in/time_out |
| RecordManualAttendance | handle() | Record attendance manually |
| ExportAttendanceCsv | handle() | Export attendance to CSV |

---

### 3.2 Student Actions
**Location:** `app/Actions/Student/`

| Class | Method | Description |
|-------|--------|-------------|
| CreateStudent | handle() | Create new student with user account |
| UpdateStudent | handle() | Update student details |
| ImportStudentsFromCsv | handle() | Import students from CSV file |

---

### 3.3 Dashboard Actions
**Location:** `app/Actions/Dashboard/`

| Class | Method | Description |
|-------|--------|-------------|
| BuildDashboard | handle() | Build dashboard data (role-based) |

---

### 3.4 AI Actions
**Location:** `app/Actions/Ai/`

| Class | Method | Description |
|-------|--------|-------------|
| QueryAssistant | handle() | Query AI with school data context |
| BuildAiContext | handle() | Build context data for AI |

---

### 3.5 Audit Actions
**Location:** `app/Actions/Audit/`

| Class | Method | Description |
|-------|--------|-------------|
| LogAuditEvent | handle() | Log audit events |

---

### 3.6 Analytics Actions
**Location:** `app/Actions/Analytics/`

| Class | Method | Description |
|-------|--------|-------------|
| BuildAnalyticsReport | handle() | Build analytics report |

---

## PART 4: FORM REQUEST VALIDATION

### 4.1 Authentication Requests
| Request Class | Rules |
|---------------|-------|
| LoginRequest | email: required, email; password: required |
| RegisterRequest | name, email, password, password_confirmation, lrn, first_name, last_name |
| UpdateProfileRequest | name, email (optional photo) |
| UpdatePasswordRequest | current_password, password, password_confirmation |

### 4.2 Student Requests
| Request Class | Rules |
|---------------|-------|
| StoreStudentRequest | first_name, last_name, lrn (12 digits), section_id (nullable), guardian_name, guardian_email |
| UpdateStudentRequest | Same as StoreStudentRequest |

### 4.3 Attendance Requests
| Request Class | Rules |
|---------------|-------|
| ManualAttendanceRequest | student_id, date, status (present/late/absent), time_out (optional) |

### 4.4 Import Requests
| Request Class | Rules |
|---------------|-------|
| ImportCsvRequest | csv_file (file), section_id (nullable) |

### 4.5 Admission Slip Requests
| Request Class | Rules |
|---------------|-------|
| StoreAdmissionSlipRequest | absence_date, reason |
| RejectAdmissionSlipRequest | review_notes |

### 4.6 Section Requests
| Request Class | Rules |
|---------------|-------|
| StoreSectionRequest | name, grade_level_id, academic_year_id |
| UpdateSectionRequest | name, grade_level_id |
| AssignTeacherRequest | teacher_id |
| StoreSectionScheduleRequest | day_of_week, start_time, end_time, grace_minutes |

### 4.7 User Management Requests
| Request Class | Rules |
|---------------|-------|
| StoreUserRequest | name, email, password, role |
| UpdateUserRequest | name, email, role, phone |
| ToggleActiveRequest | (no additional rules) |

### 4.8 AI Requests
| Request Class | Rules |
|---------------|-------|
| AiQueryRequest | question (required, max 2000 chars), start_date (optional), end_date (optional), section_id (optional) |

---

## PART 5: API ENDPOINTS

### 5.1 Authentication Routes
| Method | URI | Action | Name | Middleware |
|--------|-----|--------|------|------------|
| GET | /login | AuthenticatedSessionController@create | login | guest |
| POST | /login | AuthenticatedSessionController@store | | guest,throttle:5,1 |
| POST | /logout | AuthenticatedSessionController@destroy | logout | auth |
| GET | /register | RegisteredUserController@create | register | guest |
| POST | /register | RegisteredUserController@store | | guest |
| GET | /confirm-password | ConfirmablePasswordController@show | password.confirm | auth |
| POST | /confirm-password | ConfirmablePasswordController@store | | auth |
| PUT | /password | PasswordController@update | password.update | auth |
| POST | /forgot-password | PasswordResetLinkController@store | password.email | guest |
| GET | /reset-password/{token} | NewPasswordController@create | password.reset | guest |
| POST | /reset-password | NewPasswordController@store | password.store | guest |
| GET | /verify-email | EmailVerificationPromptController@show | verification.notice | auth |
| GET | /verify-email/{id}/{hash} | VerifyEmailController@handle | verification.verify | auth,signed,throttle:6,1 |

### 5.2 Google OAuth Routes
| Method | URI | Action | Name |
|--------|-----|--------|------|
| GET | /auth/google | GoogleController@redirect | auth.google.redirect |
| GET | /auth/google/callback | GoogleController@callback | auth.google.callback |

### 5.3 Dashboard & Pages
| Method | URI | Action | Name | Middleware |
|--------|-----|--------|------|------------|
| GET | /dashboard | DashboardController@index | dashboard | auth,verified,active |
| GET | /ai | AiController@index | ai.index | auth,role:super_admin,admin,teacher |
| POST | /ai/query | AiController@query | ai.query | auth,role:super_admin,admin,teacher |
| GET | /analytics | AnalyticsController@index | analytics.index | auth |
| GET | /audit-logs | AuditLogController@index | audit-logs.index | auth,role:super_admin,admin |
| GET | /audit-logs/{auditLog} | AuditLogController@show | audit-logs.show | auth,role:super_admin,admin |
| GET | /guardian-notifications | GuardianNotificationController@index | guardian-notifications.index | auth,role:super_admin,admin |
| GET | /guardian-notifications/{id} | GuardianNotificationController@show | guardian-notifications.show | auth,role:super_admin,admin |

### 5.4 Student Routes
| Method | URI | Action | Name | Middleware |
|--------|-----|--------|------|------------|
| GET | /students | StudentController@index | students.index | auth |
| POST | /students | StudentController@store | students.store | auth |
| GET | /students/create | StudentController@create | students.create | auth |
| GET | /students/{student} | StudentController@show | students.show | auth |
| GET | /students/{student}/edit | StudentController@edit | students.edit | auth |
| PUT/PATCH | /students/{student} | StudentController@update | students.update | auth |
| DELETE | /students/{student} | StudentController@destroy | students.destroy | auth |
| GET | /students/{student}/print-qr | StudentController@printQR | students.print-qr | auth |
| GET | /students/bulk-print-qr | StudentController@bulkPrintQR | students.bulk-print-qr | auth |
| GET | /students/import/csv | CsvImportController@index | students.import-csv | auth |
| POST | /students/import/csv | CsvImportController@import | students.import-csv.store | auth |
| GET | /students/import/csv/template | CsvImportController@template | students.import-csv.template | auth |
| GET | /students/suggestions | StudentController@suggestions | students.suggestions | auth |
| GET | /student-photos/{filename} | StudentController@photo | students.photo | auth |

### 5.5 Section Routes
| Method | URI | Action | Name | Middleware |
|--------|-----|--------|------|------------|
| GET | /sections | SectionController@index | sections.index | auth |
| POST | /sections | SectionController@store | sections.store | auth,role:super_admin,admin |
| GET | /sections/create | SectionController@create | sections.create | auth,role:super_admin,admin |
| GET | /sections/{section} | SectionController@show | sections.show | auth |
| GET | /sections/{section}/edit | SectionController@edit | sections.edit | auth,role:super_admin,admin |
| PUT/PATCH | /sections/{section} | SectionController@update | sections.update | auth,role:super_admin,admin |
| DELETE | /sections/{section} | SectionController@destroy | sections.destroy | auth,role:super_admin,admin |
| POST | /sections/{section}/assign-teacher | SectionController@assignTeacher | sections.assign-teacher | auth,role:super_admin,admin |
| DELETE | /sections/{section}/remove-teacher/{assignment} | SectionController@removeTeacher | sections.remove-teacher | auth,role:super_admin,admin |

### 5.6 Attendance Routes
| Method | URI | Action | Name | Middleware |
|--------|-----|--------|------|------------|
| GET | /attendance | AttendanceController@index | attendance.index | auth |
| POST | /attendance/manual | AttendanceController@manualEntry | attendance.manual | auth |
| GET | /attendance/export | AttendanceController@export | attendance.export | auth |

### 5.7 Admission Slip Routes
| Method | URI | Action | Name | Middleware |
|--------|-----|--------|------|------------|
| GET | /admission-slips | AdmissionSlipController@index | admission-slips.index | auth |
| POST | /admission-slips | AdmissionSlipController@store | admission-slips.store | auth |
| GET | /admission-slips/create | AdmissionSlipController@create | admission-slips.create | auth |
| GET | /admission-slips/{slip} | AdmissionSlipController@show | admission-slips.show | auth |
| POST | /admission-slips/{slip}/approve | AdmissionSlipController@approve | admission-slips.approve | auth |
| POST | /admission-slips/{slip}/reject | AdmissionSlipController@reject | admission-slips.reject | auth |

### 5.8 Guard Routes (Security Guard Only)
| Method | URI | Action | Name | Middleware |
|--------|-----|--------|------|------------|
| GET | /guard/scan | QRScanController@index | guard.scan | auth,role:security_guard |
| POST | /guard/scan | QRScanController@scan | guard.scan.store | auth,role:security_guard,throttle:60,1 |
| DELETE | /guard/scan/{record} | QRScanController@destroy | guard.scan.destroy | auth,role:security_guard |
| GET | /guard/recent | QRScanController@recent | guard.recent | auth,role:security_guard |
| GET | /guard/schedule | GuardScheduleController@show | guard.schedule.show | auth,role:security_guard |
| POST | /guard/schedule | GuardScheduleController@store | guard.schedule.store | auth,role:security_guard |

### 5.9 User Management Routes
| Method | URI | Action | Name | Middleware |
|--------|-----|--------|------|------------|
| GET | /users | UserController@index | users.index | auth,role:super_admin,admin |
| POST | /users | UserController@store | users.store | auth,role:super_admin,admin |
| GET | /users/create | UserController@create | users.create | auth,role:super_admin,admin |
| GET | /users/{user} | UserController@show | users.show | auth,role:super_admin,admin |
| GET | /users/{user}/edit | UserController@edit | users.edit | auth,role:super_admin,admin |
| PATCH | /users/{user} | UserController@update | users.update | auth,role:super_admin,admin |
| DELETE | /users/{user} | UserController@destroy | users.destroy | auth,role:super_admin,admin |
| POST | /users/{user}/toggle-active | UserController@toggleActive | users.toggle-active | auth,role:super_admin,admin |
| POST | /users/{user}/reset-password | UserController@resetPassword | users.reset-password | auth,role:super_admin,admin |
| POST | /users/{user}/force-password-change | UserController@forcePasswordChange | users.force-password-change | auth,role:super_admin,admin |
| POST | /users/{user}/restore | UserController@restore | users.restore | auth,role:super_admin,admin |

### 5.10 Teacher Routes
| Method | URI | Action | Name | Middleware |
|--------|-----|--------|------|------------|
| GET | /teachers | TeacherController@index | teachers.index | auth,role:super_admin,admin |
| POST | /teachers/assign | TeacherController@assign | teachers.assign | auth,role:super_admin,admin |
| POST | /teachers/remove | TeacherController@remove | teachers.remove | auth,role:super_admin,admin |

### 5.11 Academic Routes
| Method | URI | Action | Name | Middleware |
|--------|-----|--------|------|------------|
| GET | /academic-years | AcademicYearController@index | academic-years.index | auth,role:super_admin,admin |
| POST | /academic-years | AcademicYearController@store | academic-years.store | auth,role:super_admin,admin |
| GET | /academic-years/create | AcademicYearController@create | academic-years.create | auth,role:super_admin,admin |
| GET | /academic-years/{year} | AcademicYearController@show | academic-years.show | auth,role:super_admin,admin |
| PUT/PATCH | /academic-years/{year} | AcademicYearController@update | academic-years.update | auth,role:super_admin,admin |
| DELETE | /academic-years/{year} | AcademicYearController@destroy | academic-years.destroy | auth,role:super_admin,admin |
| GET | /academic-years/{year}/edit | AcademicYearController@edit | academic-years.edit | auth,role:super_admin,admin |
| GET | /grade-levels | GradeLevelController@index | grade-levels.index | auth,role:super_admin,admin |
| POST | /grade-levels | GradeLevelController@store | grade-levels.store | auth,role:super_admin,admin |
| GET | /grade-levels/create | GradeLevelController@create | grade-levels.create | auth,role:super_admin,admin |
| GET | /grade-levels/{level} | GradeLevelController@show | grade-levels.show | auth,role:super_admin,admin |
| PUT/PATCH | /grade-levels/{level} | GradeLevelController@update | grade-levels.update | auth,role:super_admin,admin |
| DELETE | /grade-levels/{level} | GradeLevelController@destroy | grade-levels.destroy | auth,role:super_admin,admin |
| GET | /grade-levels/{level}/edit | GradeLevelController@edit | grade-levels.edit | auth,role:super_admin,admin |

### 5.12 Section Schedule Routes
| Method | URI | Action | Name | Middleware |
|--------|-----|--------|------|------------|
| GET | /sections/{section}/schedules | SectionScheduleController@index | schedules.index | auth |
| POST | /sections/{section}/schedules | SectionScheduleController@store | schedules.store | auth,role:super_admin,admin |
| GET | /sections/{section}/schedules/create | SectionScheduleController@create | schedules.create | auth,role:super_admin,admin |
| GET | /sections/{section}/schedules/{schedule} | SectionScheduleController@show | schedules.show | auth |
| GET | /sections/{section}/schedules/{schedule}/edit | SectionScheduleController@edit | schedules.edit | auth,role:super_admin,admin |
| PUT/PATCH | /sections/{section}/schedules/{schedule} | SectionScheduleController@update | schedules.update | auth,role:super_admin,admin |
| DELETE | /sections/{section}/schedules/{schedule} | SectionScheduleController@destroy | schedules.destroy | auth,role:super_admin,admin |

---

## PART 6: SUMMARY

### Total Models: 13
1. User
2. Student
3. Section
4. AcademicYear
5. GradeLevel
6. AttendanceRecord
7. AdmissionSlip
8. GuardianNotification
9. AuditLog
10. SectionSchedule
10. TeacherSectionAssignment
12. GuardSchedule

### Total Controllers: 26
- 8 Authentication controllers
- 18 Main feature controllers

### Total Action Classes: 6
- 2 Attendance actions
- 3 Student actions
- 1 Dashboard action

### Total Form Request Classes: 14
- Authentication, Student, Attendance, Import, Admission Slip, Section, User Management, AI

### Total Routes: 106
- Authentication: 12
- Dashboard/Pages: 8
- Students: 12
- Sections: 10
- Attendance: 3
- Admission Slips: 6
- Guard: 6
- User Management: 12
- Teachers: 3
- Academic: 14
- Section Schedules: 14
- Others: 8

---

**Documentation Generated:** September 6, 2026
**System Version:** 1.0
