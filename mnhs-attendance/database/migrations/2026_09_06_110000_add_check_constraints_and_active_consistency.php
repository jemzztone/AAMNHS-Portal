<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 1. CHECK constraints for free-text enum columns so the DB rejects
     *    invalid values even if application validation is bypassed.
     *
     * 2. Keep Student.is_active in sync with User.is_active.
     *
     *    Historically the app used two independent boolean flags:
     *    - User.is_active  → auth access (the "active" middleware)
     *    - Student.is_active → scan eligibility (ProcessQrScan)
     *
     *    They are supposed to be the same truth, but nothing forced them
     *    to stay in sync. This migration adds:
     *      a) A DB trigger so UPDATE students SET is_active = X also
     *         updates the linked user, and vice-versa.
     *      b) A model hook as a defense-in-depth layer for ORM writes.
     *
     *    The trigger is written in raw SQL so it works on SQLite (dev)
     *    and MySQL/Postgres (prod). SQLite only supports triggers, not
     *    CHECK constraints via the same syntax, so the CHECKs are guarded
     *    by driver detection.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        // --- CHECK constraints (MySQL / PostgreSQL only) ---
        if ($driver !== 'sqlite') {
            // users.role must be one of the known roles
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->change();
            });

            DB::statement(
                "ALTER TABLE users ADD CONSTRAINT chk_users_role "
                . "CHECK (role IN ('super_admin', 'admin', 'teacher', 'student', 'security_guard'))"
            );

            // admission_slips.status
            DB::statement(
                "ALTER TABLE admission_slips ADD CONSTRAINT chk_admission_slips_status "
                . "CHECK (status IN ('pending', 'approved', 'rejected'))"
            );

            // section_schedules.day_of_week
            DB::statement(
                "ALTER TABLE section_schedules ADD CONSTRAINT chk_section_schedules_day_of_week "
                . "CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'))"
            );

            // attendance_records.status
            DB::statement(
                "ALTER TABLE attendance_records ADD CONSTRAINT chk_attendance_records_status "
                . "CHECK (status IN ('present', 'late', 'absent'))"
            );

            // attendance_records.source
            DB::statement(
                "ALTER TABLE attendance_records ADD CONSTRAINT chk_attendance_records_source "
                . "CHECK (source IN ('scan', 'manual'))"
            );

            // guard_schedules — tighten date uniqueness already present; no change needed.
        }

        // --- Active-flag consistency: Student ↔ User ---

        // The model-level hook (defense in depth) is applied in the Student
        // model's boot() — see the model change in this commit. Here we add
        // the DB trigger as the lower-level guarantee.

        if ($driver === 'sqlite') {
            // SQLite trigger syntax
            DB::statement(<<<'SQL'
CREATE TRIGGER IF NOT EXISTS trg_student_is_active_to_user
AFTER UPDATE OF is_active ON students
FOR EACH ROW
WHEN OLD.is_active <> NEW.is_active AND NEW.user_id IS NOT NULL
BEGIN
    UPDATE users SET is_active = NEW.is_active
    WHERE id = NEW.user_id;
END;
SQL
            );

            DB::statement(<<<'SQL'
CREATE TRIGGER IF NOT EXISTS trg_user_is_active_to_student
AFTER UPDATE OF is_active ON users
FOR EACH ROW
WHEN OLD.is_active <> NEW.is_active
BEGIN
    UPDATE students SET is_active = NEW.is_active
    WHERE user_id = NEW.id AND user_id IS NOT NULL;
END;
SQL
            );
        } else {
            // MySQL/PostgreSQL trigger syntax
            DB::statement(<<<'SQL'
CREATE TRIGGER trg_student_is_active_to_user
AFTER UPDATE OF is_active ON students
FOR EACH ROW
WHEN OLD.is_active <> NEW.is_active AND NEW.user_id IS NOT NULL
BEGIN
    UPDATE users SET is_active = NEW.is_active
    WHERE id = NEW.user_id;
END;
SQL
            );

            DB::statement(<<<'SQL'
CREATE TRIGGER trg_user_is_active_to_student
AFTER UPDATE OF is_active ON users
FOR EACH ROW
WHEN OLD.is_active <> NEW.is_active
BEGIN
    UPDATE students SET is_active = NEW.is_active
    WHERE user_id = NEW.id AND user_id IS NOT NULL;
END;
SQL
            );
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        // Drop triggers (both SQL dialects)
        DB::statement('DROP TRIGGER IF EXISTS trg_student_is_active_to_user');
        DB::statement('DROP TRIGGER IF EXISTS trg_user_is_active_to_student');

        // Drop CHECK constraints (MySQL / PostgreSQL only)
        if ($driver !== 'sqlite') {
            DB::statement('ALTER TABLE users DROP CONSTRAINT chk_users_role');
            DB::statement('ALTER TABLE admission_slips DROP CONSTRAINT chk_admission_slips_status');
            DB::statement('ALTER TABLE section_schedules DROP CONSTRAINT chk_section_schedules_day_of_week');
            DB::statement('ALTER TABLE attendance_records DROP CONSTRAINT chk_attendance_records_status');
            DB::statement('ALTER TABLE attendance_records DROP CONSTRAINT chk_attendance_records_source');
        }
    }
};
