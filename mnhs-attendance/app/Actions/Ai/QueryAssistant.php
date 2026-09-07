<?php

namespace App\Actions\Ai;

use App\Actions\Audit\LogAuditEvent;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class QueryAssistant
{
    public function handle(
        User $user,
        string $question,
        ?string $startDate,
        ?string $endDate,
        ?string $sectionId,
        ?string $ip,
        ?string $userAgent,
    ): string {
        $provider = config('ai.provider');

        $apiKey = match ($provider) {
            'gemini' => config('ai.gemini.api_key'),
            'openrouter' => config('ai.openrouter.api_key'),
            default => null,
        };

        if (blank($apiKey)) {
            throw ValidationException::withMessages([
                'question' => "AI assistance is not configured. Ask an administrator to set the appropriate API key environment variable for the {$provider} provider.",
            ]);
        }

        $startDate ??= now()->startOfMonth()->toDateString();
        $endDate ??= now()->toDateString();

        $context = (new BuildAiContext)->handle($user, $startDate, $endDate, $sectionId);
        $prompt = $this->systemPrompt($user)."\n\nSCHOOL DATA:\n".$context."\n\nQUESTION: ".$question;

        $answer = match ($provider) {
            'gemini' => $this->callGemini($apiKey, $prompt),
            'openrouter' => $this->callOpenRouter($apiKey, $prompt),
            default => throw ValidationException::withMessages([
                'question' => "Unsupported AI provider: {$provider}.",
            ]),
        };

        (new LogAuditEvent)->handle(
            event: 'ai.query',
            auditable: null,
            actor: $user,
            newValues: [
                'question' => $question,
                'answer' => $answer,
                'provider' => $provider,
                'model' => $this->getModel(),
                'period' => "{$startDate} to {$endDate}",
                'section_id' => $sectionId,
            ],
            ip: $ip,
            userAgent: $userAgent,
        );

        return $answer;
    }

    private function callGemini(string $apiKey, string $prompt): string
    {
        $model = config('ai.gemini.model');

        $response = Http::withOptions(['timeout' => config('ai.timeout_seconds')])
            ->withQueryParameters(['key' => $apiKey])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [['text' => $prompt]],
                    ],
                ],
                'generationConfig' => [
                    'maxOutputTokens' => config('ai.max_tokens'),
                    'temperature' => 0.3,
                ],
            ]);

        if ($response->failed()) {
            throw ValidationException::withMessages([
                'question' => 'The AI provider could not answer right now. Please try again later.',
            ]);
        }

        $answer = data_get($response->json(), 'candidates.0.content.parts.0.text');

        if (blank($answer)) {
            throw ValidationException::withMessages([
                'question' => 'The AI provider returned an empty answer. Please rephrase the question.',
            ]);
        }

        return $answer;
    }

    private function callOpenRouter(string $apiKey, string $prompt): string
    {
        $model = config('ai.openrouter.model');
        $siteUrl = config('ai.openrouter.site_url');
        $appName = config('ai.openrouter.app_name');

        $response = Http::withOptions(['timeout' => config('ai.timeout_seconds')])
            ->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'HTTP-Referer' => $siteUrl,
                'X-Title' => $appName,
                'Content-Type' => 'application/json',
            ])
            ->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'max_tokens' => config('ai.max_tokens'),
                'temperature' => 0.3,
            ]);

        if ($response->failed()) {
            throw ValidationException::withMessages([
                'question' => 'The AI provider could not answer right now. Please try again later.',
            ]);
        }

        $answer = data_get($response->json(), 'choices.0.message.content');

        if (blank($answer)) {
            throw ValidationException::withMessages([
                'question' => 'The AI provider returned an empty answer. Please rephrase the question.',
            ]);
        }

        return $answer;
    }

    private function getModel(): string
    {
        return match (config('ai.provider')) {
            'gemini' => config('ai.gemini.model'),
            'openrouter' => config('ai.openrouter.model'),
            default => 'unknown',
        };
    }

    private function systemPrompt(User $user): string
    {
        $role = $user->role;

        $base = <<<'PROMPT'
You are the AI assistant for Aurelio Arago MNHS, a Philippine high school.
You can answer ANY question about the school data provided to you, including
students, teachers, sections, attendance, grade levels, and audit logs.

RULES:
- Answer based ONLY on the provided data. Do not invent numbers or names.
- Be concise and direct. Keep answers under 300 words unless the user asks for detail.
- Use bullet points or tables for lists. Use numbers for rankings.
- If the data does not contain enough information to answer, say so clearly.
- You may reference specific student names, LRN, section names, teacher names, etc.
- When comparing data, use percentages or ratios when helpful.
- Respond in clear, professional English.
PROMPT;

        $roleAccess = match ($role) {
            'super_admin' => <<<'ROLE'
ACCESS LEVEL: Super Admin — full access to all data including user accounts and audit logs.
You can answer questions about any student, teacher, section, attendance record, user account,
or system audit log in the entire school.
ROLE,
            'admin' => <<<'ROLE'
ACCESS LEVEL: Admin — access to all student, teacher, section, and attendance data.
You cannot see super_admin user accounts or audit log details.
ROLE,
            'teacher' => <<<'ROLE'
ACCESS LEVEL: Teacher — access is limited to your assigned sections only.
You can only see students, teachers, and attendance data for sections assigned to you.
Do not provide data about sections you do not have access to.
ROLE,
            default => <<<'ROLE'
ACCESS LEVEL: Limited — you can only see your own data.
ROLE,
        };

        return $base."\n\n".$roleAccess;
    }
}
