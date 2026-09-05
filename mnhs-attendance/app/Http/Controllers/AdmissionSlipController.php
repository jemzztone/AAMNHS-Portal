<?php

namespace App\Http\Controllers;

use App\Actions\AdmissionSlip\ApproveAdmissionSlip;
use App\Actions\AdmissionSlip\CreateAdmissionSlip;
use App\Actions\AdmissionSlip\RejectAdmissionSlip;
use App\Http\Requests\ReviewAdmissionSlipRequest;
use App\Http\Requests\StoreAdmissionSlipRequest;
use App\Models\AdmissionSlip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AdmissionSlipController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', AdmissionSlip::class);

        $query = AdmissionSlip::with(['student.section', 'reviewedBy'])
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->student_id, fn ($q, $studentId) => $q->where('student_id', $studentId));

        if ($request->user()->role === 'teacher') {
            $sectionIds = $request->user()->assignedSections()->pluck('sections.id');
            $query->whereHas('student', fn ($q) => $q->whereIn('section_id', $sectionIds));
        }

        if ($request->user()->role === 'student') {
            $student = $request->user()->student;
            if ($student) {
                $query->where('student_id', $student->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        $slips = $query->latest()->paginate($request->get('per_page', 25));

        return Inertia::render('AdmissionSlips/Index', [
            'slips' => $slips,
            'filters' => $request->only(['status', 'student_id']),
        ]);
    }

    public function create()
    {
        $this->authorize('create', AdmissionSlip::class);

        return Inertia::render('AdmissionSlips/Create', [
            'student' => request()->user()->student,
        ]);
    }

    public function store(StoreAdmissionSlipRequest $request)
    {
        // Sensitive action: limit submissions to 3 per 5 minutes per user.
        if (RateLimiter::tooManyAttempts('admission-slip:'.$request->user()->id, 3)) {
            throw ValidationException::withMessages([
                'reason' => 'Too many admission slip submissions. Please try again later.',
            ]);
        }

        RateLimiter::hit('admission-slip:'.$request->user()->id, 300);

        $slip = (new CreateAdmissionSlip)->handle(
            $request->user(),
            $request->validated(),
            $request->file('attachment'),
            $request->ip(),
            $request->userAgent(),
        );

        return redirect()->route('admission-slips.show', $slip)->with('success', 'Admission slip submitted successfully.');
    }

    public function show(AdmissionSlip $admissionSlip)
    {
        $this->authorize('view', $admissionSlip);

        $admissionSlip->load(['student.section', 'reviewedBy']);

        return Inertia::render('AdmissionSlips/Show', [
            'slip' => $admissionSlip,
        ]);
    }

    public function approve(ReviewAdmissionSlipRequest $request, AdmissionSlip $admissionSlip)
    {
        (new ApproveAdmissionSlip)->handle(
            $admissionSlip,
            $request->user(),
            $request->validated('review_notes'),
            $request->ip(),
            $request->userAgent(),
        );

        return back()->with('success', 'Admission slip approved.');
    }

    public function reject(ReviewAdmissionSlipRequest $request, AdmissionSlip $admissionSlip)
    {
        (new RejectAdmissionSlip)->handle(
            $admissionSlip,
            $request->user(),
            $request->validated('review_notes'),
            $request->ip(),
            $request->userAgent(),
        );

        return back()->with('success', 'Admission slip rejected.');
    }
}
