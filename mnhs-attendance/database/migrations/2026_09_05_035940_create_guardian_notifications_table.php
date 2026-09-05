<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guardian_notifications', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('student_id', 36);
            $table->string('attendance_record_id', 36)->nullable();
            $table->string('guardian_email');
            $table->string('subject');
            $table->text('body');
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->text('failure_reason')->nullable();
            $table->integer('attempts')->default(0);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->foreign('attendance_record_id')->references('id')->on('attendance_records')->nullOnDelete();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guardian_notifications');
    }
};
