<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Grade levels are a fixed taxonomy (Grade 7-10); they are not owned
        // by an academic year. Sections carry the academic year (3NF).
        Schema::create('grade_levels', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('name')->unique();
            $table->integer('level_number')->unique();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grade_levels');
    }
};
