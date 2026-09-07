<?php

namespace App\Http\Controllers;

use App\Actions\Student\ImportStudentsFromCsv;
use App\Http\Requests\ImportStudentsRequest;
use App\Models\Section;
use App\Models\Student;
use Inertia\Inertia;

class CsvImportController extends Controller
{
    /**
     * Download a ready-to-fill CSV template so data entry is consistent
     * with the importer's expected columns.
     */
    public function template()
    {
        $this->authorize('canImportStudents', Student::class);

        $output = fopen('php://temp', 'r+');

        fputcsv($output, ['first_name', 'last_name', 'middle_name', 'lrn', 'guardian_name', 'guardian_email']);
        fputcsv($output, ['Juan', 'Dela Cruz', 'Santos', '123456789012', 'Maria Dela Cruz', 'maria.delacruz@email.com']);
        fputcsv($output, ['Pedro', 'Penduko', '', '987654321098', 'Bathala dela Cruz', 'bathala@email.com']);

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="student_import_template.csv"',
        ]);
    }

    public function index()
    {
        $this->authorize('canImportStudents', Student::class);

        return Inertia::render('Students/ImportCsv', [
            'sections' => Section::all(),
            'user' => auth()->user(),
            'xlsxSupported' => class_exists('ZipArchive') && class_exists('PhpOffice\PhpSpreadsheet\IOFactory'),
        ]);
    }

    public function store(ImportStudentsRequest $request)
    {
        $this->authorize('canImportStudents', Student::class);

        $result = (new ImportStudentsFromCsv)->handle(
            $request->file('csv_file'),
            $request->validated('section_id'),
            $request->user(),
        );

        $request->session()->flash('import_result', $result);

        return redirect()->route('students.index')->with('success', $result['success'] > 0
            ? "{$result['success']} student(s) imported successfully."
            : 'No students were imported.');
    }
}
