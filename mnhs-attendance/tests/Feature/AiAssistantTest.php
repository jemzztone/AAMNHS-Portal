<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiAssistantTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'email_verified_at' => now(),
        ]);
    }

    public function test_ai_endpoint_is_restricted_to_admins(): void
    {
        $teacher = $this->makeUser('teacher');

        $this->actingAs($teacher)
            ->postJson(route('ai.query'), ['question' => 'Who is late most often?'])
            ->assertForbidden();
    }

    public function test_ai_endpoint_returns_friendly_error_when_not_configured(): void
    {
        config(['ai.provider' => 'openrouter', 'ai.openrouter.api_key' => null]);

        $admin = $this->makeUser('admin');

        $this->actingAs($admin)
            ->postJson(route('ai.query'), ['question' => 'Who is late most often?'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('question');
    }

    public function test_ai_endpoint_answers_question_and_logs_usage(): void
    {
        config(['ai.provider' => 'openrouter', 'ai.openrouter.api_key' => 'test-key']);

        Http::fake([
            'openrouter.ai/api/v1/*' => Http::response([
                'choices' => [
                    ['message' => ['content' => 'Grade 7 - A was late most often.']],
                ],
            ]),
        ]);

        $admin = $this->makeUser('admin');

        $this->actingAs($admin)
            ->postJson(route('ai.query'), ['question' => 'Which section was late most often?'])
            ->assertOk()
            ->assertJsonPath('answer', 'Grade 7 - A was late most often.');

        $this->assertDatabaseHas('audit_logs', [
            'event' => 'ai.query',
            'user_id' => $admin->id,
        ]);

        $log = AuditLog::where('event', 'ai.query')->firstOrFail();
        $this->assertSame('Which section was late most often?', $log->new_values['question']);
        $this->assertSame('Grade 7 - A was late most often.', $log->new_values['answer']);
    }

    public function test_ai_endpoint_is_rate_limited(): void
    {
        config(['ai.provider' => 'openrouter', 'ai.openrouter.api_key' => 'test-key']);

        Http::fake([
            'openrouter.ai/api/v1/*' => Http::response([
                'choices' => [
                    ['message' => ['content' => 'ok']],
                ],
            ]),
        ]);

        $admin = $this->makeUser('admin');

        foreach (range(1, 3) as $i) {
            $this->actingAs($admin)
                ->postJson(route('ai.query'), ['question' => "Question {$i}"])
                ->assertOk();
        }

        $this->actingAs($admin)
            ->postJson(route('ai.query'), ['question' => 'Question 4'])
            ->assertStatus(429);
    }
}
