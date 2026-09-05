<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The academic year is implied by the section (section -> academic_year),
        // so it is not duplicated here (3NF). One teacher per section.
        Schema::create('teacher_section_assignments', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('section_id', 36);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('section_id')->references('id')->on('sections')->cascadeOnDelete();
            $table->unique(['user_id', 'section_id'], 'tsa_user_section_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_section_assignments');
    }
};
