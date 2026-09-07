# Test Cases - MNHS Attendance Monitoring System

## Test Case Document

**System:** MNHS Attendance Monitoring System  
**Version:** 1.0  
**Tester:** Senior QA Engineer  
**Date:** September 6, 2026

---

## 1. USER AUTHENTICATION & AUTHORIZATION

### TC-001: User Login with Different Roles
**Preconditions:** Database has users with different roles (super_admin, admin, teacher, security_guard, student)  
**Steps:**
1. Login as super_admin
2. Login as admin
3. Login as teacher
4. Login as security_guard
5. Login as student

**Expected Result:** All users can login successfully with appropriate dashboard access

---

### TC-002: Teacher Can Only See Assigned Sections
**Preconditions:** Teacher is assigned to specific sections  
**Steps:**
1. Login as teacher
2. Navigate to Students list
3. Observe which students/sections are visible

**Expected Result:** Teacher can only see students from their assigned sections

---

### TC-003: Teacher Cannot Access Other Section Data
**Preconditions:** Teacher assigned to Section A, Student exists in Section B  
**Steps:**
1. Login as teacher
2. Try to view student from Section B (different from assigned)
3. Try to edit student from Section B
4. Try to record attendance for student from Section B

**Expected Result:** Teacher cannot view/edit/record attendance for students outside assigned sections

---

## 2. STUDENT MANAGEMENT

### TC-004: Create Student as Super Admin
**Preconditions:** Logged in as super_admin  
**Steps:**
1. Navigate to Students > Create
2. Fill in required fields (first_name, last_name, lrn, section_id)
3. Submit form

**Expected Result:** Student created successfully with proper user account

---

### TC-005: Create Student as Teacher (Assigned Section)
**Preconditions:** Teacher assigned to Section X  
**Steps:**
1. Login as teacher
2. Navigate to Students > Create
3. Select Section X (assigned)
4. Fill in required fields
5. Submit form

**Expected Result:** Student created successfully in assigned section

---

### TC-006: Create Student as Teacher (Non-Assigned Section) - NEGATIVE TEST
**Preconditions:** Teacher assigned to Section X only  
**Steps:**
1. Login as teacher
2. Navigate to Students > Create
3. Try to select Section Y (not assigned)
4. Fill in required fields
5. Submit form

**Expected Result:** ERROR - Teacher cannot create student in non-assigned section

---

### TC-007: CSV Import as Super Admin
**Preconditions:** Valid CSV file with proper format  
**Steps:**
1. Login as super_admin
2. Navigate to Students > Import CSV
3. Upload valid CSV file
4. Select section (optional)
5. Submit

**Expected Result:** Students imported successfully, success count matches CSV rows

---

### TC-008: CSV Import as Teacher (Assigned Section) - NEGATIVE TEST
**Preconditions:** Teacher assigned to Section X, CSV has students for Section Y  
**Steps:**
1. Login as teacher
2. Navigate to Students > Import CSV
3. Upload CSV file
4. Select Section Y (not assigned)
5. Submit

**Expected Result:** ERROR - Cannot import to non-assigned section

---

### TC-009: CSV Import Validation - Invalid LRN Format
**Preconditions:** CSV with invalid LRN (not 12 digits)  
**Steps:**
1. Login as admin
2. Navigate to Students > Import CSV
3. Upload CSV with LRN like "123" or "abc123"
4. Submit

**Expected Result:** Import fails for invalid LRN rows, shows proper error message

---

### TC-010: CSV Import Validation - Duplicate LRN
**Preconditions:** Database has student with LRN "123456789012"  
**Steps:**
1. Login as admin
2. Navigate to Students > Import CSV
3. Upload CSV with duplicate LRN "123456789012"
4. Submit

**Expected Result:** Import fails for duplicate LRN, shows proper error message

---

## 3. ATTENDANCE RECORDING

### TC-011: QR Code Scan - Time In
**Preconditions:** Student has QR code with valid token  
**Steps:**
1. Login as security_guard
2. Navigate to attendance scan page
3. Scan student QR code (or enter QR token)
4. Submit scan

**Expected Result:** Attendance record created with status "present" or "late", time_in recorded

---

### TC-012: QR Code Scan - Time Out
**Preconditions:** Student already timed in for the day  
**Steps:**
1. Login as security_guard
2. Navigate to attendance scan page
3. Scan student QR code (student already has time_in)
4. Select "Time Out" mode
5. Submit

**Expected Result:** time_out recorded on existing attendance record

---

### TC-013: QR Code Scan - Already Timed Out - NEGATIVE TEST
**Preconditions:** Student already timed in AND out for the day  
**Steps:**
1. Login as security_guard
2. Navigate to attendance scan page
3. Scan student QR code (student already has time_in AND time_out)
4. Submit

**Expected Result:** ERROR - Student has already clocked out today

---

### TC-014: Manual Attendance Entry by Teacher
**Preconditions:** Teacher assigned to section with students  
**Steps:**
1. Login as teacher
2. Navigate to Attendance > Manual Entry
3. Select student from assigned section
4. Enter date, status (present/late/absent)
5. Submit

**Expected Result:** Attendance record created for student

---

### TC-015: Manual Attendance - Teacher for Non-Assigned Student - NEGATIVE TEST
**Preconditions:** Teacher assigned to Section X, try to record attendance for Section Y student  
**Steps:**
1. Login as teacher
2. Navigate to Attendance > Manual Entry
3. Try to select student from Section Y
4. Submit

**Expected Result:** ERROR - Teacher can only record attendance for assigned section students

---

### TC-016: Manual Attendance Entry by Admin
**Preconditions:** Logged in as admin  
**Steps:**
1. Login as admin
2. Navigate to Attendance > Manual Entry
3. Select any student
4. Enter date, status
5. Submit

**Expected Result:** Attendance record created (admin has full access)

---

## 4. GUARDIAN NOTIFICATIONS

### TC-017: Notification Created on Time In
**Preconditions:** Student has guardian_email in database  
**Steps:**
1. Record attendance (time in) for student with guardian_email
2. Check guardian_notifications table

**Expected Result:** Notification record created with status "pending", then "sent"

---

### TC-018: Notification Created on Time Out
**Preconditions:** Student has guardian_email, already timed in  
**Steps:**
1. Record attendance (time out) for student
2. Check guardian_notifications table

**Expected Result:** Notification record created for time out event

---

### TC-019: No Notification for Student Without Guardian Email
**Preconditions:** Student has NULL guardian_email  
**Steps:**
1. Record attendance for student with NULL guardian_email
2. Check guardian_notifications table

**Expected Result:** No notification created (system skips notification)

---

## 5. ADMISSION SLIPS

### TC-020: Create Admission Slip for Absent Student
**Preconditions:** Student has "absent" status for previous day  
**Steps:**
1. Login as admin/parent
2. Navigate to Admission Slips
3. Create slip for absent date
4. Submit for approval

**Expected Result:** Admission slip created with status "pending"

---

### TC-021: Approve Admission Slip
**Preconditions:** Admission slip exists with status "pending"  
**Steps:**
1. Login as admin
2. Navigate to pending admission slips
3. Approve the slip

**Expected Result:** Slip status changed to "approved"

---

### TC-022: QR Scan with Required Admission Slip
**Preconditions:** Student was absent yesterday, no approved admission slip  
**Steps:**
1. Login as security_guard
2. Navigate to attendance scan
3. Scan student QR code (student was absent yesterday)

**Expected Result:** ERROR - No approved admission slip required for entry

---

## 6. AI ASSISTANT

### TC-023: AI Query as Super Admin
**Preconditions:** AI provider configured, logged in as super_admin  
**Steps:**
1. Navigate to AI Assistant
2. Ask question about attendance data
3. Submit query

**Expected Result:** AI returns answer based on school data

---

### TC-024: AI Query as Teacher (Limited Access)
**Preconditions:** Teacher assigned to specific sections  
**Steps:**
1. Login as teacher
2. Navigate to AI Assistant
3. Ask question about students in assigned section
4. Ask question about students in non-assigned section

**Expected Result:** AI can answer about assigned section, cannot/should not provide data about other sections

---

## 7. DASHBOARD

### TC-025: Admin Dashboard Shows Correct Stats
**Preconditions:** Attendance records exist in database  
**Steps:**
1. Login as admin
2. Navigate to dashboard
3. Check stats (total_students, present_today, late_today, absent_today)

**Expected Result:** Dashboard shows accurate counts matching database

---

### TC-026: Teacher Dashboard Shows Only Assigned Section Data
**Preconditions:** Teacher assigned to Section X, attendance records exist for Section X and Y  
**Steps:**
1. Login as teacher
2. Navigate to dashboard
3. Check stats and recent attendance

**Expected Result:** Dashboard only shows data for assigned sections

---

### TC-027: Student Dashboard Shows Personal QR Code
**Preconditions:** Student logged in  
**Steps:**
1. Login as student
2. Navigate to dashboard
3. Check QR code display

**Expected Result:** Dashboard shows student's personal QR code for attendance scanning

---

## 8. ANALYTICS

### TC-028: Analytics Report Generation
**Preconditions:** Attendance data exists for date range  
**Steps:**
1. Login as admin
2. Navigate to Analytics
3. Select date range
4. Generate report

**Expected Result:** Report shows attendance summary, late students, absent students

---

## 9. SECURITY & EDGE CASES

### TC-029: Unauthenticated Access Attempt
**Preconditions:** User not logged in  
**Steps:**
1. Try to access /students, /attendance, /dashboard directly

**Expected Result:** Redirected to login page

---

### TC-030: Invalid QR Code Scan
**Preconditions:** None  
**Steps:**
1. Login as security_guard
2. Enter invalid QR token
3. Submit scan

**Expected Result:** ERROR - Invalid QR code, student not found

---

### TC-031: Inactive Student QR Scan
**Preconditions:** Student exists but is_active = false  
**Steps:**
1. Login as security_guard
2. Scan inactive student QR code

**Expected Result:** ERROR - Student account is inactive

---

### TC-032: Double Attendance Prevention
**Preconditions:** Student already has attendance record for today  
**Steps:**
1. Login as security_guard
2. Scan student QR code (already has time_in)
3. Try to scan again with time_in mode

**Expected Result:** ERROR - Student has already timed in today

---

## Test Data Requirements

### Users Needed:
- super_admin (1)
- admin (1)
- teacher (2) - each assigned to different sections
- security_guard (1)
- student (5+)

### Students Needed:
- Multiple students across different sections
- Some with guardian_email, some without
- Some active, some inactive

### Attendance Records:
- Mix of present, late, absent statuses
- Some with time_in only, some with time_in and time_out

### Sections:
- Multiple sections across different grade levels

---

## Bug Tracking Template

| ID | Test Case | Severity | Description | Status |
|----|-----------|----------|-------------|--------|
| BUG-001 | | | | |

---

## End-to-End Test Execution Log

| Date | Tester | Tests Executed | Passed | Failed | Blocked |
|------|--------|----------------|--------|--------|---------|
| | | | | | |
