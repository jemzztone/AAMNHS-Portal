<?php

namespace App\Actions\Student;

use App\Models\Section;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportStudentsFromCsv
{
    /**
     * @return array{success: int, failed: int, errors: string[]}
     */
    public function handle(UploadedFile $file, ?string $sectionId): array
    {
        $section = $sectionId ? Section::findOrFail($sectionId) : null;
        $success = 0;
        $failed = 0;
        $errors = [];

        $rows = array_map('str_getcsv', file($file->getRealPath()));
        $headers = array_map('strtolower', array_shift($rows));

        $requiredColumns = ['first_name', 'last_name', 'lrn'];
        $missingColumns = array_diff($requiredColumns, $headers);

        if (! empty($missingColumns)) {
            return [
                'success' => 0,
                'failed' => count($rows),
                'errors' => ['Missing required columns: ' . implode(', ', $missingColumns)],
            ];
        }

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;
            $data = array_combine($headers, $row);

            if (! $data || ! isset($data['first_name'], $data['last_name'], $data['lrn'])) {
                $failed++;
                $errors[] = "Row {$rowNumber}: Missing required fields.";
                continue;
            }

            $data['first_name'] = trim($data['first_name']);
            $data['last_name'] = trim($data['last_name']);
            $data['lrn'] = trim($data['lrn']);
            $data['middle_name'] = trim($data['middle_name'] ?? '');
            $data['guardian_name'] = trim($data['guardian_name'] ?? '');
            $data['guardian_email'] = trim($data['guardian_email'] ?? '');

            if (empty($data['first_name']) || empty($data['last_name']) || empty($data['lrn'])) {
                $failed++;
                $errors[] = "Row {$rowNumber}: First name, last name, and LRN are required.";
                continue;
            }

            if (! preg_match('/^\d{12}$/', $data['lrn'])) {
                $failed++;
                $errors[] = "Row {$rowNumber}: LRN must be exactly 12 digits.";
                continue;
            }

            if (\App\Models\Student::where('lrn', $data['lrn'])->exists()) {
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

                (new CreateStudent)->handle($studentData);
                $success++;
            } catch (\Exception $e) {
                $failed++;
                $errors[] = "Row {$rowNumber}: {$e->getMessage()}";
                Log::error("CSV import failed for row {$rowNumber}: {$e->getMessage()}");
            }
        }

        return [
            'success' => $success,
            'failed' => $failed,
            'errors' => $errors,
        ];
    }
}
