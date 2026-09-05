<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('section_schedules', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('section_id', 36);
            $table->string('day_of_week');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('grace_minutes')->default(15);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('section_id')->references('id')->on('sections')->cascadeOnDelete();
            $table->index(['section_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('section_schedules');
    }
};
