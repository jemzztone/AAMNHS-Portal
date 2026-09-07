<?php

namespace App\Http\Controllers;

use App\Actions\Student\CreateStudent;
use App\Actions\Student\UpdateStudent;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Student::class);

        $query = Student::with('section.gradeLevel')
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

        $students = $query->paginate(min(max((int) $request->get('per_page', 5), 1), 100));

        return Inertia::render('Students/Index', [
            'students' => $students,
            'sections' => Section::all(),
            'filters' => $request->only(['search', 'section_id']),
            'user' => $request->user(),
        ]);
    }

    /**
     * Autocomplete suggestions while the user types in the search bar.
     * Returns a small, name-first list of matching students.
     */
    public function suggestions(Request $request)
    {
        $this->authorize('viewAny', Student::class);

        $q = trim((string) $request->get('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json([]);
        }

        $query = Student::with('section')
            ->where(function ($query) use ($q) {
                $query->where('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%")
                    ->orWhere('middle_name', 'like', "%{$q}%")
                    ->orWhere('lrn', 'like', "%{$q}%");
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(8);

        if ($request->user()->role === 'teacher') {
            $sectionIds = $request->user()->assignedSections()->pluck('sections.id');
            $query->whereIn('section_id', $sectionIds);
        }

        return response()->json(
            $query->get()->map(fn (Student $student) => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'lrn' => $student->lrn,
                'section' => $student->section?->name,
            ]),
        );
    }

    /**
     * Serve a stored student photo (auth-protected, no public symlink needed).
     */
    public function photo(Request $request, string $filename)
    {
        if (! in_array($request->user()->role, ['super_admin', 'admin', 'teacher', 'security_guard'])) {
            abort(403);
        }

        if (! preg_match('/^[A-Za-z0-9._-]+$/', $filename)) {
            abort(404);
        }

        $path = 'student-photos/'.$filename;

        if (! Storage::disk('public')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public')->response($path);
    }

    public function create()
    {
        $this->authorize('create', Student::class);

        $user = request()->user();
        $sections = $user->role === 'teacher'
            ? $user->assignedSections()->with('gradeLevel')->get()
            : Section::with('gradeLevel')->get();

        return Inertia::render('Students/Create', [
            'sections' => $sections,
            'gradeLevels' => GradeLevel::orderBy('level_number')->get(),
        ]);
    }

    public function store(StoreStudentRequest $request)
    {
        $this->authorize('create', Student::class);

        // Pass the actor for section access validation
        $student = (new CreateStudent)->handle($request->validated(), $request->user());

        return redirect()->route('students.show', $student)->with('success', 'Student created successfully.');
    }

    public function show(Student $student)
    {
        $this->authorize('view', $student);

        $student->load(['section.gradeLevel', 'attendanceRecords' => fn ($q) => $q->latest('date')->take(30)]);

        return Inertia::render('Students/Show', [
            'student' => $student,
            'qr_svg' => (string) QrCode::size(200)->generate($student->qr_token),
        ]);
    }

    public function edit(Student $student)
    {
        $this->authorize('update', $student);

        $user = request()->user();
        $isTeacher = $user->role === 'teacher';

        if ($isTeacher) {
            $sections = $user->assignedSections()->with('gradeLevel')->get();
            // Teachers can only edit their assigned section — lock the section field
            if ($student->section_id && ! $sections->pluck('id')->contains($student->section_id)) {
                abort(403, 'You can only edit students in your assigned sections.');
            }
        } else {
            $sections = Section::with('gradeLevel')->get();
        }

        return Inertia::render('Students/Edit', [
            'student' => $student,
            'sections' => $sections,
            'gradeLevels' => GradeLevel::orderBy('level_number')->get(),
            'isTeacher' => $isTeacher,
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $this->authorize('update', $student);

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

    public function bulkPrintQR(Request $request)
    {
        $this->authorize('viewAny', Student::class);

        $query = Student::with('section.gradeLevel');

        if ($request->section_id) {
            $query->where('section_id', $request->section_id);
        } elseif ($request->grade_level_id) {
            $query->whereHas('section', function ($q) use ($request) {
                $q->where('grade_level_id', $request->grade_level_id);
            });
        }

        if ($request->user()->role === 'teacher') {
            $sectionIds = $request->user()->assignedSections()->pluck('sections.id');
            $query->whereIn('section_id', $sectionIds);
        }

        $students = $query->orderBy('last_name')->orderBy('first_name')->get();

        $studentsWithQR = $students->map(function ($student) {
            return [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'lrn' => $student->lrn,
                'section' => $student->section?->name,
                'grade_level' => $student->section?->gradeLevel?->name,
                'qr_svg' => (string) QrCode::size(180)->generate($student->qr_token),
            ];
        });

        return Inertia::render('Students/BulkPrintQR', [
            'students' => $studentsWithQR,
            'sections' => $request->user()->role === 'teacher'
                ? $request->user()->assignedSections()->with('gradeLevel')->get()
                : Section::with('gradeLevel')->get(),
            'gradeLevels' => GradeLevel::all(),
            'filters' => $request->only(['section_id', 'grade_level_id']),
        ]);
    }
}
