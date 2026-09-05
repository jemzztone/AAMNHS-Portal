<?php

namespace App\Actions\Ai;

use App\Actions\Analytics\BuildAnalyticsReport;
use App\Actions\Audit\LogAuditEvent;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class QueryAssistant
{
    public function handle(
        User $admin,
        string $question,
        string $startDate,
        string $endDate,
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

        $report = (new BuildAnalyticsReport)->handle($admin, $startDate, $endDate, $sectionId);
        $context = $this->buildContext($report, $startDate, $endDate);

        $prompt = $this->systemPrompt()."\n\nSCHOOL ATTENDANCE DATA:\n".$context."\n\nQUESTION: ".$question;

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
            actor: $admin,
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

    private function systemPrompt(): string
    {
        return <<<'PROMPT'
You are the analytics assistant for Aurelio Arago MNHS, a Philippine high school.
You answer questions about student attendance data. You are given a JSON snapshot
of the school's attendance analytics (totals, section late rankings, frequently
late students, earliest arrivals, top absentees).
Answer the user's question in clear, concise English, based ONLY on the provided
data. If the data does not contain the answer, say so plainly. Do not invent
numbers. Keep answers under 250 words.
PROMPT;
    }

    /**
     * @param  array<string, mixed>  $report
     */
    private function buildContext(array $report, string $startDate, string $endDate): string
    {
        return json_encode([
            'period' => "{$startDate} to {$endDate}",
            'stats' => $report['stats'],
            'section_ranking_by_lates' => $report['sectionRanking']
                ->map(fn ($item) => [
                    'section' => $item->section?->name,
                    'late_count' => $item->late_count,
                ])
                ->values(),
            'most_frequently_late_students' => $report['lateStudents']
                ->map(fn ($student) => [
                    'name' => $student->full_name,
                    'late_count' => $student->late_count,
                ])
                ->values(),
            'earliest_arrivals' => $report['earlyArrivals']
                ->map(fn ($student) => [
                    'name' => $student->full_name,
                    'earliest_time' => $student->earliest_time,
                ])
                ->values(),
            'top_absent_students' => $report['absenteeism']
                ->map(fn ($student) => [
                    'name' => $student->full_name,
                    'absent_count' => $student->absent_count,
                ])
                ->values(),
        ], JSON_PRETTY_PRINT);
    }
}
