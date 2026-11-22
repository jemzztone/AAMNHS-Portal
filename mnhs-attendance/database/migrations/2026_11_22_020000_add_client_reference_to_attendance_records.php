<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Scans recorded while the guard device is offline are queued in
     * IndexedDB and replayed later. The client reference lets the server
     * recognise a replay and skip it instead of double-recording the student.
     */
    public function up(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->string('client_reference', 64)->nullable()->after('source');
            $table->unique('client_reference');
        });
    }

    public function down(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->dropUnique(['client_reference']);
            $table->dropColumn('client_reference');
        });
    }
};
