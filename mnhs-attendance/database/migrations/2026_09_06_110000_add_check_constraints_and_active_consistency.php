<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
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
        }

        // --- Active-flag consistency: Student <-> User ---
        if ($driver === 'pgsql') {
            // PostgreSQL requires a function + trigger
            DB::statement(<<<'SQL'
CREATE OR REPLACE FUNCTION sync_student_user_is_active()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_TABLE_NAME = 'students' THEN
        IF OLD.is_active IS DISTINCT FROM NEW.is_active AND NEW.user_id IS NOT NULL THEN
            UPDATE users SET is_active = NEW.is_active WHERE id = NEW.user_id;
        END IF;
        RETURN NEW;
    ELSIF TG_TABLE_NAME = 'users' THEN
        IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
            UPDATE students SET is_active = NEW.is_active WHERE user_id = NEW.id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;
SQL
            );

            DB::statement('DROP TRIGGER IF EXISTS trg_student_user_is_active ON students');
            DB::statement(<<<'SQL'
CREATE TRIGGER trg_student_user_is_active
AFTER UPDATE OF is_active ON students
FOR EACH ROW EXECUTE FUNCTION sync_student_user_is_active();
SQL
            );

            DB::statement('DROP TRIGGER IF EXISTS trg_user_student_is_active ON users');
            DB::statement(<<<'SQL'
CREATE TRIGGER trg_user_student_is_active
AFTER UPDATE OF is_active ON users
FOR EACH ROW EXECUTE FUNCTION sync_student_user_is_active();
SQL
            );
        } elseif ($driver === 'sqlite') {
            // SQLite trigger syntax
            DB::statement(<<<'SQL'
CREATE TRIGGER IF NOT EXISTS trg_student_is_active_to_user
AFTER UPDATE OF is_active ON students
FOR EACH ROW
WHEN OLD.is_active <> NEW.is_active AND NEW.user_id IS NOT NULL
BEGIN
    UPDATE users SET is_active = NEW.is_active WHERE id = NEW.user_id;
END;
SQL
            );

            DB::statement(<<<'SQL'
CREATE TRIGGER IF NOT EXISTS trg_user_is_active_to_student
AFTER UPDATE OF is_active ON users
FOR EACH ROW
WHEN OLD.is_active <> NEW.is_active
BEGIN
    UPDATE students SET is_active = NEW.is_active WHERE user_id = NEW.id AND user_id IS NOT NULL;
END;
SQL
            );
        } else {
            // MySQL trigger syntax
            DB::statement(<<<'SQL'
CREATE TRIGGER trg_student_is_active_to_user
AFTER UPDATE OF is_active ON students
FOR EACH ROW
WHEN OLD.is_active <> NEW.is_active AND NEW.user_id IS NOT NULL
BEGIN
    UPDATE users SET is_active = NEW.is_active WHERE id = NEW.user_id;
END;
SQL
            );

            DB::statement(<<<'SQL'
CREATE TRIGGER trg_user_is_active_to_student
AFTER UPDATE OF is_active ON users
FOR EACH ROW
WHEN OLD.is_active <> NEW.is_active
BEGIN
    UPDATE students SET is_active = NEW.is_active WHERE user_id = NEW.id AND user_id IS NOT NULL;
END;
SQL
            );
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        // Drop triggers
        DB::statement('DROP TRIGGER IF EXISTS trg_student_is_active_to_user');
        DB::statement('DROP TRIGGER IF EXISTS trg_user_is_active_to_student');
        DB::statement('DROP TRIGGER IF EXISTS trg_student_user_is_active ON students');
        DB::statement('DROP TRIGGER IF EXISTS trg_user_student_is_active ON users');

        if ($driver === 'pgsql') {
            DB::statement('DROP FUNCTION IF EXISTS sync_student_user_is_active()');
        }

        // Drop CHECK constraints (MySQL / PostgreSQL only)
        if ($driver !== 'sqlite') {
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_role');
            DB::statement('ALTER TABLE admission_slips DROP CONSTRAINT IF EXISTS chk_admission_slips_status');
            DB::statement('ALTER TABLE section_schedules DROP CONSTRAINT IF EXISTS chk_section_schedules_day_of_week');
            DB::statement('ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS chk_attendance_records_status');
            DB::statement('ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS chk_attendance_records_source');
        }
    }
};