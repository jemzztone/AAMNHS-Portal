<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Browser push subscriptions (one row per device). The endpoint is the
     * push service URL and must be unique because re-subscribing on the same
     * device returns the same endpoint.
     */
    public function up(): void
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('endpoint');
            $table->string('public_key');
            $table->string('auth_token');
            $table->string('content_encoding', 32)->default('aesgcm');
            $table->string('user_agent', 255)->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('endpoint', 'push_subscriptions_endpoint_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
