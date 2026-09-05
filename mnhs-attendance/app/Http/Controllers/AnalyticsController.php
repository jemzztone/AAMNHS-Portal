<?php

namespace App\Http\Controllers;

use App\Actions\Analytics\BuildAnalyticsReport;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAnalytics', Student::class);

        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        $report = (new BuildAnalyticsReport)->handle(
            $request->user(),
            $startDate,
            $endDate,
            $request->get('section_id'),
        );

        return Inertia::render('Analytics/Index', [
            ...$report,
            'filters' => $request->only(['start_date', 'end_date', 'section_id']),
            'sections' => Section::all(),
        ]);
    }
}
