<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('name');
            $table->string('grade_level_id', 36);
            $table->string('academic_year_id', 36);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('grade_level_id')->references('id')->on('grade_levels')->cascadeOnDelete();
            $table->foreign('academic_year_id')->references('id')->on('academic_years')->cascadeOnDelete();
            $table->index(['grade_level_id', 'academic_year_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
