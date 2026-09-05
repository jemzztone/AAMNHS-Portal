<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('lrn')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            // Grade level is derived from the student's section (3NF):
            // student -> section -> grade_levels.
            $table->string('section_id', 36)->nullable();
            $table->string('photo_path')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_email')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('section_id')->references('id')->on('sections')->nullOnDelete();
            $table->index(['section_id', 'is_active']);
            $table->index('lrn');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
