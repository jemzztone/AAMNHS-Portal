<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admission_slips', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('student_id', 36);
            $table->date('absence_date');
            $table->text('reason');
            $table->string('guardian_reference')->nullable();
            $table->string('attachment_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['student_id', 'status']);
            $table->index('absence_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admission_slips');
    }
};
