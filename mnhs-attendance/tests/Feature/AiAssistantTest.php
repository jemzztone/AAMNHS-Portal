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

    public function test_ai_endpoint_is_restricted_to_authorized_roles(): void
    {
        $student = $this->makeUser('student');

        $this->actingAs($student)
            ->postJson(route('ai.query'), ['question' => 'Who is late most often?'])
            ->assertForbidden();
    }

    public function test_teacher_can_access_ai(): void
    {
        config(['ai.provider' => 'openrouter', 'ai.openrouter.api_key' => 'test-key']);

        Http::fake([
            'openrouter.ai/api/v1/*' => Http::response([
                'choices' => [
                    ['message' => ['content' => 'You have 5 students in your sections.']],
                ],
            ]),
        ]);

        $teacher = $this->makeUser('teacher');

        $this->actingAs($teacher)
            ->postJson(route('ai.query'), ['question' => 'How many students do I have?'])
            ->assertOk()
            ->assertJsonPath('answer', 'You have 5 students in your sections.');
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

    public function test_super_admin_can_see_audit_logs_in_context(): void
    {
        config(['ai.provider' => 'openrouter', 'ai.openrouter.api_key' => 'test-key']);

        Http::fake([
            'openrouter.ai/api/v1/*' => Http::response([
                'choices' => [
                    ['message' => ['content' => 'There are 10 users in the system.']],
                ],
            ]),
        ]);

        $superAdmin = $this->makeUser('super_admin');

        $this->actingAs($superAdmin)
            ->postJson(route('ai.query'), ['question' => 'How many users are there?'])
            ->assertOk();
    }

    public function test_question_max_length_is_2000(): void
    {
        $admin = $this->makeUser('admin');

        $longQuestion = str_repeat('a', 2001);

        $this->actingAs($admin)
            ->postJson(route('ai.query'), ['question' => $longQuestion])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('question');
    }
}
