<?php

namespace App\Actions\Student;

use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportStudentsFromCsv
{
    /**
     * Import students from CSV or XLSX file
     *
     * @return array{success: int, failed: int, errors: string[]}
     */
    public function handle(UploadedFile $file, ?string $sectionId, ?User $actor = null): array
    {
        // Validate section access for teachers
        if ($actor && $actor->role === 'teacher' && $sectionId) {
            if (! $actor->assignedSections()->where('sections.id', $sectionId)->exists()) {
                return [
                    'success' => 0,
                    'failed' => 0,
                    'errors' => ['You can only import students to your assigned sections.'],
                ];
            }
        }
        if ($actor && $actor->role === 'teacher' && ! $sectionId) {
            return [
                'success' => 0,
                'failed' => 0,
                'errors' => ['Teachers must select a section when importing students.'],
            ];
        }

        $section = $sectionId ? Section::findOrFail($sectionId) : null;
        $success = 0;
        $failed = 0;
        $errors = [];

        // Read file content based on file type
        $rows = $this->readFile($file);

        if (empty($rows)) {
            return [
                'success' => 0,
                'failed' => 0,
                'errors' => ['Could not read file content.'],
            ];
        }

        if (empty($rows[0])) {
            return [
                'success' => 0,
                'failed' => 0,
                'errors' => ['File contains no headers.'],
            ];
        }

        $headers = array_map('trim', array_map('strtolower', $rows[0]));

        // Remove BOM from first header if present
        if (str_starts_with($headers[0], "\xEF\xBB\xBF")) {
            $headers[0] = substr($headers[0], 3);
        }

        Log::info('Import headers: '.json_encode($headers));

        $requiredColumns = ['first_name', 'last_name', 'lrn'];
        $missingColumns = array_diff($requiredColumns, $headers);

        if (! empty($missingColumns)) {
            return [
                'success' => 0,
                'failed' => count($rows) - 1,
                'errors' => ['Missing required columns: '.implode(', ', $missingColumns).'. Found: '.implode(', ', $headers)],
            ];
        }

        // Process data rows (skip header)
        for ($i = 1; $i < count($rows); $i++) {
            $rowNumber = $i + 1;
            $row = $rows[$i];

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            $data = array_combine($headers, $row);

            if (! isset($data['first_name'], $data['last_name'], $data['lrn'])) {
                $failed++;
                $errors[] = "Row {$rowNumber}: Missing required fields.";

                continue;
            }

            $data['first_name'] = trim($data['first_name'] ?? '');
            $data['last_name'] = trim($data['last_name'] ?? '');
            $data['lrn'] = trim($data['lrn'] ?? '');
            $data['middle_name'] = trim($data['middle_name'] ?? '');
            $data['guardian_name'] = trim($data['guardian_name'] ?? '');
            $data['guardian_email'] = trim($data['guardian_email'] ?? '');

            if (empty($data['first_name']) || empty($data['last_name']) || empty($data['lrn'])) {
                $failed++;
                $errors[] = "Row {$rowNumber}: First name, last name, and LRN are required.";

                continue;
            }

            // Clean LRN - remove non-digits
            $data['lrn'] = preg_replace('/\D/', '', $data['lrn']);

            if (! preg_match('/^\d{12}$/', $data['lrn'])) {
                $failed++;
                $errors[] = "Row {$rowNumber}: LRN must be exactly 12 digits (got: '{$data['lrn']}').";

                continue;
            }

            if (Student::where('lrn', $data['lrn'])->exists()) {
                $failed++;
                $errors[] = "Row {$rowNumber}: LRN '{$data['lrn']}' already exists.";

                continue;
            }

            $effectiveSectionId = $section?->id ?? ($data['section_id'] ?? null);

            try {
                $studentData = [
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'middle_name' => $data['middle_name'] ?: null,
                    'lrn' => $data['lrn'],
                    'section_id' => $effectiveSectionId,
                    'guardian_name' => $data['guardian_name'] ?: null,
                    'guardian_email' => $data['guardian_email'] ?: null,
                ];

                Log::info("Importing student: {$data['first_name']} {$data['last_name']} (LRN: {$data['lrn']})");

                (new CreateStudent)->handle($studentData);
                $success++;

                Log::info("Successfully imported: {$data['first_name']} {$data['last_name']}");
            } catch (\Exception $e) {
                $failed++;
                $errors[] = "Row {$rowNumber}: {$e->getMessage()}";
                Log::error("Import failed row {$rowNumber}: {$e->getMessage()}");
            }
        }

        Log::info("Import completed: {$success} success, {$failed} failed");

        return [
            'success' => $success,
            'failed' => $failed,
            'errors' => $errors,
        ];
    }

    /**
     * Read file content from CSV or XLSX
     *
     * @return array<array<string|null>>
     */
    private function readFile(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());

        Log::info("Importing file: {$file->getClientOriginalName()} (type: {$extension})");

        if ($extension === 'xlsx' || $extension === 'xls') {
            return $this->readXlsx($file);
        }

        return $this->readCsv($file);
    }

    /**
     * Read CSV file
     *
     * @return array<array<string|null>>
     */
    private function readCsv(UploadedFile $file): array
    {
        $content = '';

        // Try multiple methods to read the file
        $path = $file->getPathname();

        if ($path && file_exists($path)) {
            $content = file_get_contents($path);
        }

        if (empty($content)) {
            $realPath = $file->getRealPath();
            if ($realPath && file_exists($realPath)) {
                $content = file_get_contents($realPath);
            }
        }

        if (empty($content)) {
            if ($file->isValid()) {
                $content = file_get_contents($file->getPathname());
            }
        }

        if (empty($content)) {
            Log::error('Could not read CSV file content');

            return [];
        }

        // Remove BOM if present
        if (str_starts_with($content, "\xEF\xBB\xBF")) {
            $content = substr($content, 3);
            Log::info('BOM removed from CSV file');
        }

        // Parse CSV
        $lines = explode("\n", str_replace(["\r\n", "\r"], "\n", $content));
        $lines = array_values(array_filter($lines, fn ($line) => trim($line) !== ''));

        if (empty($lines)) {
            return [];
        }

        $rows = array_map('str_getcsv', $lines);

        return array_values($rows);
    }

    /**
     * Read XLSX file using PhpSpreadsheet
     *
     * @return array<array<string|null>>
     */
    private function readXlsx(UploadedFile $file): array
    {
        // Check if ZipArchive is available (required for XLSX)
        if (! class_exists('ZipArchive')) {
            Log::warning('ZipArchive not available - XLSX import not supported on this server');

            return [];
        }

        if (! class_exists('PhpOffice\PhpSpreadsheet\IOFactory')) {
            Log::error('PhpSpreadsheet not installed');

            return [];
        }

        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            if (empty($rows)) {
                Log::error('XLSX file is empty');

                return [];
            }

            // Remove completely empty rows
            $rows = array_values(array_filter($rows, fn ($row) => ! empty(array_filter($row))));

            Log::info('XLSX loaded: '.count($rows).' rows');

            return $rows;
        } catch (\Exception $e) {
            Log::error('Failed to read XLSX: '.$e->getMessage());

            return [];
        }
    }
}
