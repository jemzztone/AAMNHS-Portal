<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const STATUSES = ['pending', 'sent', 'failed', 'skipped'];

    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            // Laravel compiles enum() to a check constraint on PostgreSQL, and
            // the constraint is auto-named, so look it up before replacing it.
            DB::statement(<<<'SQL'
                DO $$
                DECLARE constraint_name text;
                BEGIN
                    SELECT conname INTO constraint_name
                    FROM pg_constraint
                    WHERE conrelid = 'guardian_notifications'::regclass
                      AND contype = 'c'
                      AND pg_get_constraintdef(oid) LIKE '%status%';

                    IF constraint_name IS NOT NULL THEN
                        EXECUTE format('ALTER TABLE guardian_notifications DROP CONSTRAINT %I', constraint_name);
                    END IF;
                END $$;
            SQL);

            DB::statement(
                "ALTER TABLE guardian_notifications ADD CONSTRAINT guardian_notifications_status_check CHECK (status in ('pending', 'sent', 'failed', 'skipped'))"
            );

            return;
        }

        Schema::table('guardian_notifications', function (Blueprint $table) {
            $table->enum('status', self::STATUSES)->default('pending')->change();
        });
    }

    public function down(): void
    {
        DB::table('guardian_notifications')->where('status', 'skipped')->update(['status' => 'failed']);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE guardian_notifications DROP CONSTRAINT IF EXISTS guardian_notifications_status_check');
            DB::statement(
                "ALTER TABLE guardian_notifications ADD CONSTRAINT guardian_notifications_status_check CHECK (status in ('pending', 'sent', 'failed'))"
            );

            return;
        }

        Schema::table('guardian_notifications', function (Blueprint $table) {
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending')->change();
        });
    }
};
