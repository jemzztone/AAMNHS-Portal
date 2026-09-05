<?php

namespace App\Http\Controllers;

use App\Actions\Student\ImportStudentsFromCsv;
use App\Http\Requests\ImportCsvRequest;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CsvImportController extends Controller
{
    public function index()
    {
        $this->authorize('create', \App\Models\Student::class);

        return Inertia::render('Students/ImportCsv', [
            'sections' => Section::all(),
        ]);
    }

    public function import(ImportCsvRequest $request)
    {
        $this->authorize('create', \App\Models\Student::class);

        $result = (new ImportStudentsFromCsv)->handle(
            $request->file('csv_file'),
            $request->validated('section_id'),
        );

        return redirect()->route('students.index')->with('import_result', $result);
    }
}
