<?php

use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\AdmissionSlipController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceRecordController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\CsvImportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GradeLevelController;
use App\Http\Controllers\GuardianNotificationController;
use App\Http\Controllers\GuardScheduleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QRScanController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\SectionScheduleController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => app()->version(),
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified', 'active', 'force-password-change'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Students
    Route::get('students/bulk-print-qr', [StudentController::class, 'bulkPrintQR'])->name('students.bulk-print-qr');
    Route::get('students/{student}/print-qr', [StudentController::class, 'printQR'])->name('students.print-qr');
    Route::get('students/import/csv', [CsvImportController::class, 'index'])->name('students.import-csv')->middleware('role:super_admin,admin');
    Route::get('students/import/csv/template', [CsvImportController::class, 'template'])->name('students.import-csv.template')->middleware('role:super_admin,admin');
    Route::post('students/import/csv', [CsvImportController::class, 'store'])->name('students.import-csv.store')->middleware('role:super_admin,admin')->middleware('throttle:10,1');
    Route::get('students/suggestions', [StudentController::class, 'suggestions'])->middleware('throttle:60,1')->name('students.suggestions');
    Route::get('student-photos/{filename}', [StudentController::class, 'photo'])->name('students.photo');
    Route::resource('students', StudentController::class);

    // Sections
    Route::resource('sections', SectionController::class);
    Route::post('sections/{section}/assign-teacher', [SectionController::class, 'assignTeacher'])->name('sections.assign-teacher');
    Route::delete('sections/{section}/remove-teacher/{assignment}', [SectionController::class, 'removeTeacher'])->name('sections.remove-teacher');

    // Section Schedules
    Route::resource('sections/{section}/schedules', SectionScheduleController::class);

    // Attendance
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::get('/attendance-records/{attendanceRecord}', [AttendanceRecordController::class, 'show'])->name('attendance-records.show');
    Route::post('/attendance/manual', [AttendanceController::class, 'manualEntry'])->name('attendance.manual');
    Route::get('/attendance/export', [AttendanceController::class, 'export'])->name('attendance.export');

    // Admission Slips
    Route::resource('admission-slips', AdmissionSlipController::class)->except(['edit', 'update', 'destroy']);
    Route::get('admission-slips/{admissionSlip}/attachment', [AdmissionSlipController::class, 'attachment'])->name('admission-slips.attachment');
    Route::post('admission-slips/{admissionSlip}/approve', [AdmissionSlipController::class, 'approve'])->name('admission-slips.approve');
    Route::post('admission-slips/{admissionSlip}/reject', [AdmissionSlipController::class, 'reject'])->name('admission-slips.reject');

    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

    // Academic Years (admin only)
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::resource('academic-years', AcademicYearController::class);
    });

    // Grade Levels (admin only)
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::resource('grade-levels', GradeLevelController::class);
    });

    // Audit Logs (read-only, admin only)
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show'])->name('audit-logs.show');
    });

    // Guardian Notifications (read-only, admin only)
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::get('/guardian-notifications', [GuardianNotificationController::class, 'index'])->name('guardian-notifications.index');
        Route::get('/guardian-notifications/{guardianNotification}', [GuardianNotificationController::class, 'show'])->name('guardian-notifications.show');
    });

    // User Management (super_admin + admin)
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::resource('users', UserController::class)->except(['edit', 'update']);
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::post('users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
        Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
        Route::post('users/{user}/force-password-change', [UserController::class, 'forcePasswordChange'])->name('users.force-password-change');
        Route::post('users/{user}/restore', [UserController::class, 'restore'])->name('users.restore');

        // Teacher Management
        Route::get('/teachers', [TeacherController::class, 'index'])->name('teachers.index');
        Route::post('/teachers/assign', [TeacherController::class, 'assign'])->name('teachers.assign');
        Route::post('/teachers/remove', [TeacherController::class, 'remove'])->name('teachers.remove');
    });

    // AI Assistant
    Route::middleware(['role:super_admin,admin,teacher'])->group(function () {
        Route::get('/ai', [AiController::class, 'index'])->name('ai.index');
        // AI calls hit a paid external API: cap abuse at 20 requests/min.
        Route::post('/ai/query', [AiController::class, 'query'])
            ->middleware('throttle:20,1')
            ->name('ai.query');
    });

    // Guard QR Scan (security guard role only)
    Route::middleware('role:security_guard')->group(function () {
        Route::get('/guard/scan', [QRScanController::class, 'index'])->name('guard.scan');
        Route::post('/guard/scan', [QRScanController::class, 'scan'])
            ->middleware('throttle:60,1')
            ->name('guard.scan.store');
        Route::delete('/guard/scan/{attendanceRecord}', [QRScanController::class, 'destroy'])
            ->name('guard.scan.destroy');
        Route::get('/guard/recent', [QRScanController::class, 'recent'])->name('guard.recent');
        Route::get('/guard/schedule', [GuardScheduleController::class, 'show'])->name('guard.schedule.show');
        Route::post('/guard/schedule', [GuardScheduleController::class, 'store'])->name('guard.schedule.store');
    });
});

require __DIR__.'/auth.php';
