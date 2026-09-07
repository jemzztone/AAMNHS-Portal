<?php

namespace App\Http\Controllers;

use App\Actions\Ai\QueryAssistant;
use App\Http\Requests\AiQueryRequest;
use Inertia\Inertia;

class AiController extends Controller
{
    public function index()
    {
        return Inertia::render('Ai/Index');
    }

    public function query(AiQueryRequest $request)
    {
        $answer = (new QueryAssistant)->handle(
            $request->user(),
            $request->validated('question'),
            $request->validated('start_date', now()->startOfMonth()->toDateString()),
            $request->validated('end_date', now()->toDateString()),
            $request->validated('section_id'),
            $request->ip(),
            $request->userAgent(),
        );

        return response()->json(['answer' => $answer]);
    }
}
