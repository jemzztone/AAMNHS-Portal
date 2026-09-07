<?php

namespace App\Http\Controllers;

use App\Models\GuardSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class GuardScheduleController extends Controller
{
    public function show(): JsonResponse
    {
        $today = Carbon::now()->toDateString();
        $schedule = GuardSchedule::where('date', $today)->first();

        return response()->json([
            'schedule' => $schedule ? [
                'id' => $schedule->id,
                'date' => $schedule->date->toDateString(),
                'time_in' => $schedule->time_in,
                'time_out' => $schedule->time_out,
            ] : null,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'time_in' => 'required|date_format:H:i',
            'time_out' => 'required|date_format:H:i|after:time_in',
        ]);

        $today = Carbon::now()->toDateString();

        $schedule = GuardSchedule::updateOrCreate(
            ['date' => $today],
            [
                'time_in' => $validated['time_in'],
                'time_out' => $validated['time_out'],
                'set_by' => $request->user()->id,
            ],
        );

        return response()->json([
            'schedule' => [
                'id' => $schedule->id,
                'date' => $schedule->date->toDateString(),
                'time_in' => $schedule->time_in,
                'time_out' => $schedule->time_out,
            ],
        ]);
    }
}
