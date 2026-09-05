<?php

use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\AdmissionSlipController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\CsvImportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GradeLevelController;
use App\Http\Controllers\GuardianNotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QRScanController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\SectionScheduleController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => app()->version(),
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified', 'active'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Students
    Route::resource('students', StudentController::class);
    Route::get('students/{student}/print-qr', [StudentController::class, 'printQR'])->name('students.print-qr');
    Route::get('students/import/csv', [CsvImportController::class, 'index'])->name('students.import-csv');
    Route::post('students/import/csv', [CsvImportController::class, 'import'])->name('students.import-csv.store');

    // Sections
    Route::resource('sections', SectionController::class);
    Route::post('sections/{section}/assign-teacher', [SectionController::class, 'assignTeacher'])->name('sections.assign-teacher');
    Route::delete('sections/{section}/remove-teacher/{assignment}', [SectionController::class, 'removeTeacher'])->name('sections.remove-teacher');

    // Section Schedules
    Route::resource('sections/{section}/schedules', SectionScheduleController::class)->except(['edit']);

    // Attendance
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance/manual', [AttendanceController::class, 'manualEntry'])->name('attendance.manual');
    Route::get('/attendance/export', [AttendanceController::class, 'export'])->name('attendance.export');

    // Admission Slips
    Route::resource('admission-slips', AdmissionSlipController::class)->except(['edit', 'update', 'destroy']);
    Route::post('admission-slips/{admissionSlip}/approve', [AdmissionSlipController::class, 'approve'])->name('admission-slips.approve');
    Route::post('admission-slips/{admissionSlip}/reject', [AdmissionSlipController::class, 'reject'])->name('admission-slips.reject');

    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

    // Academic Years
    Route::resource('academic-years', AcademicYearController::class);

    // Grade Levels
    Route::resource('grade-levels', GradeLevelController::class);

    // Audit Logs (read-only)
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show'])->name('audit-logs.show');

    // Guardian Notifications (read-only)
    Route::get('/guardian-notifications', [GuardianNotificationController::class, 'index'])->name('guardian-notifications.index');
    Route::get('/guardian-notifications/{guardianNotification}', [GuardianNotificationController::class, 'show'])->name('guardian-notifications.show');

    // AI Assistant (Admin only)
    Route::middleware(['role:super_admin,admin'])->group(function () {
        Route::post('/ai/query', [AiController::class, 'query'])
            ->middleware('throttle:3,5')
            ->name('ai.query');
    });

    // Guard QR Scan (security guard role only)
    Route::middleware('role:security_guard')->group(function () {
        Route::get('/guard/scan', [QRScanController::class, 'index'])->name('guard.scan');
        Route::post('/guard/scan', [QRScanController::class, 'scan'])
            ->middleware('throttle:60,1')
            ->name('guard.scan.store');
    });
});

require __DIR__.'/auth.php';
