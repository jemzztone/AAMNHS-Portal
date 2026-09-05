<?php

namespace App\Http\Controllers;

use App\Actions\Student\CreateStudent;
use App\Actions\Student\UpdateStudent;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Student::class);

        $query = Student::with('section')
            ->when($request->search, fn ($q, $search) => $q->where(function ($query) use ($search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%");
            }))
            ->when($request->section_id, fn ($q, $sectionId) => $q->where('section_id', $sectionId));

        if ($request->user()->role === 'teacher') {
            $sectionIds = $request->user()->assignedSections()->pluck('sections.id');
            $query->whereIn('section_id', $sectionIds);
        }

        $students = $query->paginate($request->get('per_page', 25));

        return Inertia::render('Students/Index', [
            'students' => $students,
            'sections' => Section::all(),
            'filters' => $request->only(['search', 'section_id']),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Student::class);

        return Inertia::render('Students/Create', [
            'sections' => Section::all(),
        ]);
    }

    public function store(StoreStudentRequest $request)
    {
        $student = (new CreateStudent)->handle($request->validated());

        return redirect()->route('students.show', $student)->with('success', 'Student created successfully.');
    }

    public function show(Student $student)
    {
        $this->authorize('view', $student);

        $student->load(['section', 'attendanceRecords' => fn ($q) => $q->latest('date')->take(30)]);

        return Inertia::render('Students/Show', [
            'student' => $student,
            'qr_svg' => (string) QrCode::size(200)->generate($student->qr_token),
        ]);
    }

    public function edit(Student $student)
    {
        $this->authorize('update', $student);

        return Inertia::render('Students/Edit', [
            'student' => $student,
            'sections' => Section::all(),
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        (new UpdateStudent)->handle($student, $request->validated());

        return redirect()->route('students.show', $student)->with('success', 'Student updated successfully.');
    }

    public function destroy(Student $student)
    {
        $this->authorize('delete', $student);

        $student->delete();

        return redirect()->route('students.index')->with('success', 'Student deleted successfully.');
    }

    public function printQR(Student $student)
    {
        $this->authorize('view', $student);

        return Inertia::render('Students/PrintQR', [
            'student' => $student,
            'qr_svg' => (string) QrCode::size(240)->generate($student->qr_token),
        ]);
    }
}
