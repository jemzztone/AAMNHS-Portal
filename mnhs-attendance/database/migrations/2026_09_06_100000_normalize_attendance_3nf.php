<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Normalize to 3NF:
     *
     * 1. attendance_records.section_id is a transitive dependency
     *    (attendance_record -> student -> section). The section of a record
     *    is always derived from the student, so the duplicated column is
     *    removed to eliminate redundancy and the risk of stale data.
     *
     * 2. students.user_id must be unique — each login account maps to
     *    exactly one student profile (1:1 relationship).
     */
    public function up(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->dropForeign(['section_id']);
            $table->dropIndex(['section_id', 'date']);
            $table->dropColumn('section_id');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
        });

        Schema::table('attendance_records', function (Blueprint $table) {
            $table->string('section_id', 36)->nullable()->after('student_id');
            $table->index(['section_id', 'date']);
            $table->foreign('section_id')->references('id')->on('sections')->cascadeOnDelete();
        });
    }
};
