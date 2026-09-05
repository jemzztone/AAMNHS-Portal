<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('student_id', 36);
            $table->string('section_id', 36);
            $table->date('date');
            $table->enum('status', ['present', 'late', 'absent'])->default('absent');
            $table->time('time_in')->nullable();
            $table->enum('source', ['scan', 'manual'])->default('scan');
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->foreign('section_id')->references('id')->on('sections')->cascadeOnDelete();
            $table->foreign('recorded_by')->references('id')->on('users')->nullOnDelete();
            $table->unique(['student_id', 'date']);
            $table->index(['section_id', 'date']);
            $table->index(['date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
