# Data Import Guide: XLSX & CSV File Extraction

## Overview

This guide covers how to extract student data from **CSV** and **XLSX** files in the AAMNHS Attendance Monitoring System.

---

## 1. File Format Requirements

### CSV Format
```csv
first_name,last_name,lrn,middle_name,guardian_name,guardian_email
Juan,Dela Cruz,123456789012,Santos,Maria Dela Cruz,maria@email.com
Pedro,Penduko,987654321098,,Bathala dela Cruz,bathala@email.com
```

**Required columns:**
- `first_name` — Student's first name
- `last_name` — Student's last name  
- `lrn` — 12-digit Learner Reference Number

**Optional columns:**
- `middle_name` — Student's middle name
- `guardian_name` — Parent/guardian full name
- `guardian_email` — Guardian email for notifications

### XLSX Format
Same column structure as CSV, but in Excel format:
- Sheet name: any (reads first sheet)
- Header row: row 1
- Data rows: row 2 onwards
- Empty rows: automatically skipped

---

## 2. Backend Architecture

### File Flow

```
User Uploads File
       │
       ▼
┌─────────────────────────────────────┐
│  CsvImportController::store()       │
│  - Authorize (admin/super_admin)    │
│  - Validate request                 │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  ImportStudentsFromCsv::handle()    │
│  - Detect file type (.csv/.xlsx)    │
│  - Read file content                │
│  - Validate rows                    │
│  - Create students                  │
└─────────────────────────────────────┘
       │
       ▼
┌──────────────┐    ┌─────────────────┐
│  readCsv()   │    │   readXlsx()    │
│  - file_get  │    │  PhpSpreadsheet │
│  - str_getcsv│    │  IOFactory      │
└──────────────┘    └─────────────────┘
```

### Key Classes

| Class | Responsibility |
|-------|----------------|
| `CsvImportController` | HTTP request handling, authorization |
| `ImportStudentsRequest` | Form validation (mimes, file size) |
| `ImportStudentsFromCsv` | File reading, row processing, student creation |
| `CreateStudent` action | Student record creation with section assignment |

---

## 3. Step-by-Step Implementation

### Step 1: Install PhpSpreadsheet (for XLSX support)

```bash
composer require phpoffice/phpspreadsheet
```

Add to `composer.json` autoload files (so class is always available):
```json
"autoload": {
    "files": [
        "vendor/phpoffice/phpspreadsheet/src/PhpSpreadsheet/IOFactory.php"
    ]
}
```

Then run:
```bash
composer dump-autoload
```

### Step 2: Create the Import Action

File: `app/Actions/Student/ImportStudentsFromCsv.php`

```php
<?php

namespace App\Actions\Student;

use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class ImportStudentsFromCsv
{
    public function handle(UploadedFile $file, ?string $sectionId, ?User $actor = null): array
    {
        // 1. Validate section access for teachers
        if ($actor && $actor->role === 'teacher' && $sectionId) {
            if (!$actor->assignedSections()->where('sections.id', $sectionId)->exists()) {
                return ['success' => 0, 'failed' => 0, 'errors' => ['You can only import students to your assigned sections.']];
            }
        }

        // 2. Read file based on extension
        $rows = $this->readFile($file);

        if (empty($rows)) {
            return ['success' => 0, 'failed' => 0, 'errors' => ['Could not read file content.']];
        }

        // 3. Parse headers
        $headers = array_map('trim', array_map('strtolower', $rows[0]));

        // Remove BOM if present
        if (str_starts_with($headers[0], "\xEF\xBB\xBF")) {
            $headers[0] = substr($headers[0], 3);
        }

        // 4. Validate required columns
        $requiredColumns = ['first_name', 'last_name', 'lrn'];
        $missingColumns = array_diff($requiredColumns, $headers);

        if (!empty($missingColumns)) {
            return [
                'success' => 0,
                'failed' => count($rows) - 1,
                'errors' => ['Missing required columns: ' . implode(', ', $missingColumns)]
            ];
        }

        // 5. Process each data row
        $success = 0;
        $failed = 0;
        $errors = [];

        for ($i = 1; $i < count($rows); $i++) {
            $rowNumber = $i + 1;
            $row = $rows[$i];

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            $data = array_combine($headers, $row);

            // Validate required fields
            $data['first_name'] = trim($data['first_name'] ?? '');
            $data['last_name'] = trim($data['last_name'] ?? '');
            $data['lrn'] = trim($data['lrn'] ?? '');

            if (empty($data['first_name']) || empty($data['last_name']) || empty($data['lrn'])) {
                $failed++;
                $errors[] = "Row {$rowNumber}: First name, last name, and LRN are required.";
                continue;
            }

            // Clean LRN - keep only digits
            $data['lrn'] = preg_replace('/\D/', '', $data['lrn']);

            // Validate LRN is exactly 12 digits
            if (!preg_match('/^\d{12}$/', $data['lrn'])) {
                $failed++;
                $errors[] = "Row {$rowNumber}: LRN must be exactly 12 digits (got: '{$data['lrn']}').";
                continue;
            }

            // Check for duplicate LRN
            if (Student::where('lrn', $data['lrn'])->exists()) {
                $failed++;
                $errors[] = "Row {$rowNumber}: LRN '{$data['lrn']}' already exists.";
                continue;
            }

            // Create student
            try {
                $studentData = [
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'middle_name' => trim($data['middle_name'] ?? '') ?: null,
                    'lrn' => $data['lrn'],
                    'section_id' => $sectionId,
                    'guardian_name' => trim($data['guardian_name'] ?? '') ?: null,
                    'guardian_email' => trim($data['guardian_email'] ?? '') ?: null,
                ];

                (new CreateStudent)->handle($studentData);
                $success++;
            } catch (\Exception $e) {
                $failed++;
                $errors[] = "Row {$rowNumber}: {$e->getMessage()}";
            }
        }

        return [
            'success' => $success,
            'failed' => $failed,
            'errors' => $errors,
        ];
    }

    private function readFile(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === 'xlsx' || $extension === 'xls') {
            return $this->readXlsx($file);
        }

        return $this->readCsv($file);
    }

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
        }

        // Parse CSV
        $lines = explode("\n", str_replace(["\r\n", "\r"], "\n", $content));
        $lines = array_values(array_filter($lines, fn($line) => trim($line) !== ''));

        if (empty($lines)) {
            return [];
        }

        $rows = array_map('str_getcsv', $lines);
        return array_values($rows);
    }

    private function readXlsx(UploadedFile $file): array
    {
        // Check prerequisites
        if (!class_exists('ZipArchive')) {
            Log::warning('ZipArchive not available - XLSX import not supported');
            return [];
        }

        if (!class_exists('PhpOffice\PhpSpreadsheet\IOFactory')) {
            Log::error('PhpSpreadsheet not installed');
            return [];
        }

        try {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            if (empty($rows)) {
                Log::error('XLSX file is empty');
                return [];
            }

            // Remove completely empty rows
            $rows = array_values(array_filter($rows, fn($row) => !empty(array_filter($row))));

            Log::info("XLSX loaded: " . count($rows) . " rows");

            return $rows;
        } catch (\Exception $e) {
            Log::error("Failed to read XLSX: " . $e->getMessage());
            return [];
        }
    }
}
```

### Step 3: Create the Form Request

File: `app/Http/Requests/ImportStudentsRequest.php`

```php
<?php

namespace App\Http\Requests;

use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;

class ImportStudentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('canImportStudents', Student::class);
    }

    public function rules(): array
    {
        $user = $this->user();
        $isAdminOrTeacher = in_array($user->role, ['admin', 'teacher']);
        $xlsxSupported = class_exists('ZipArchive') && class_exists('PhpOffice\PhpSpreadsheet\IOFactory');

        $allowedMimes = 'csv,txt';
        if ($isAdminOrTeacher && $xlsxSupported) {
            $allowedMimes .= ',xlsx,xls';
        }

        return [
            'csv_file' => ['required', 'file', "mimes:{$allowedMimes}", 'max:10240'],
            'section_id' => 'nullable|exists:sections,id',
        ];
    }

    public function messages(): array
    {
        $user = $this->user();
        $isAdminOrTeacher = in_array($user->role, ['admin', 'teacher']);
        $xlsxSupported = class_exists('ZipArchive') && class_exists('PhpOffice\PhpSpreadsheet\IOFactory');

        $mimeMessage = 'The file must be a valid CSV or TXT file.';
        if ($isAdminOrTeacher && $xlsxSupported) {
            $mimeMessage = 'The file must be a valid CSV, TXT, XLSX, or XLS file.';
        } elseif ($isAdminOrTeacher && !$xlsxSupported) {
            $mimeMessage = 'XLSX files are not supported on this server. Please use CSV or TXT files.';
        }

        return [
            'csv_file.required' => 'Please select a file to import.',
            'csv_file.mimes' => $mimeMessage,
            'csv_file.max' => 'The file size must not exceed 10MB.',
        ];
    }
}
```

### Step 4: Create the Controller

File: `app/Http/Controllers/CsvImportController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Actions\Student\ImportStudentsFromCsv;
use App\Http\Requests\ImportStudentsRequest;
use App\Models\Section;
use Inertia\Inertia;

class CsvImportController extends Controller
{
    public function index()
    {
        $this->authorize('canImportStudents', \App\Models\Student::class);

        return Inertia::render('Students/ImportCsv', [
            'sections' => Section::all(),
            'user' => auth()->user(),
            'xlsxSupported' => class_exists('ZipArchive') && class_exists('PhpOffice\PhpSpreadsheet\IOFactory'),
        ]);
    }

    public function store(ImportStudentsRequest $request)
    {
        $this->authorize('canImportStudents', \App\Models\Student::class);

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
```

### Step 5: Register Routes

In `routes/web.php`:

```php
Route::get('students/import/csv', [CsvImportController::class, 'index'])
    ->name('students.import-csv')
    ->middleware('role:super_admin,admin');

Route::post('students/import/csv', [CsvImportController::class, 'store'])
    ->name('students.import-csv.store')
    ->middleware('role:super_admin,admin')
    ->middleware('throttle:10,1');
```

### Step 6: Create Frontend Page

File: `resources/js/Pages/Students/ImportCsv.jsx`

Key features:
- Dynamic file accept attribute based on role + server capability
- Visual feedback for XLSX support status
- Drag & drop zone with file preview
- Import result notification after redirect

```jsx
export default function ImportCsv({ sections, user, xlsxSupported = false }) {
    const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

    // Only allow XLSX if admin/teacher AND server supports it
    const allowXlsx = isAdminOrTeacher && xlsxSupported;

    const fileTypes = ['.csv', '.txt'];
    if (allowXlsx) {
        fileTypes.push('.xlsx', '.xls');
    }
    const acceptedFileTypes = fileTypes.join(',');

    // File input uses accept={acceptedFileTypes}
    // Drag & drop zone shows file info after selection
    // Submit sends POST to route('students.import-csv.store')
}
```

### Step 7: Add Policy Method

In `app/Policies/StudentPolicy.php`:

```php
public function canImportStudents(User $user): bool
{
    return in_array($user->role, ['super_admin', 'admin']);
}
```

---

## 4. Data Extraction Details

### CSV Extraction

**Method 1: `file_get_contents()`**
```php
$content = file_get_contents($file->getPathname());
```
- Simple and fast for small files
- May fail for files in temp directories

**Method 2: `fopen()` + `fgetcsv()`**
```php
$handle = fopen($file->getPathname(), 'r');
while (($row = fgetcsv($handle)) !== false) {
    // Process $row
}
fclose($handle);
```
- Memory efficient for large files
- Better for streaming large CSV files

**Method 3: `str_getcsv()`**
```php
$lines = explode("\n", $content);
$rows = array_map('str_getcsv', $lines);
```
- What we use — parses entire content at once
- Good for files under 10MB

### XLSX Extraction (PhpSpreadsheet)

```php
$spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
$sheet = $spreadsheet->getActiveSheet();
$rows = $sheet->toArray();
```

**What happens:**
1. `IOFactory::load()` detects file format automatically
2. Reads the ZIP archive (XLSX is a ZIP of XML files)
3. Parses the shared strings and sheet data
4. Returns 2D array: `[$rowIndex][$columnIndex]`

**Requirements:**
- PHP `zip` extension (for opening XLSX as ZIP)
- PhpSpreadsheet library installed

---

## 5. Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `csv_file` | required | Please select a file |
| `csv_file` | mimes:csv,txt[,xlsx,xls] | Invalid file type |
| `csv_file` | max:10240 (10MB) | File too large |
| `first_name` | required, max:255 | Missing first name |
| `last_name` | required, max:255 | Missing last name |
| `lrn` | required, 12 digits | Invalid LRN format |
| `lrn` | unique in DB | LRN already exists |
| `section_id` | exists:sections,id | Invalid section |

---

## 6. Error Handling

### File Read Errors
- **BOM characters**: Auto-detected and removed (UTF-8 BOM: `\xEF\xBB\xBF`)
- **Empty rows**: Skipped automatically
- **Missing headers**: Returns error with list of found columns
- **Unreadable file**: Returns error, no partial import

### Row-Level Errors
- Missing required fields → skip row, log error
- Invalid LRN format → skip row, log error
- Duplicate LRN → skip row, log error
- Database insert failure → skip row, log error

### Server Capability
- **No ZipArchive**: XLSX files rejected at validation level
- **No PhpSpreadsheet**: XLSX files rejected, clear error message shown

---

## 7. Testing the Import

### Create Test Files

**test.csv:**
```csv
first_name,last_name,lrn
Test,Student,111111111111
```

**test.xlsx (using PhpSpreadsheet):**
```php
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setCellValue('A1', 'first_name');
$sheet->setCellValue('B1', 'last_name');
$sheet->setCellValue('C1', 'lrn');
$sheet->setCellValue('A2', 'Test');
$sheet->setCellValue('B2', 'Student');
$sheet->setCellValue('C2', '111111111111');
$writer = new Xlsx($spreadsheet);
$writer->save('test.xlsx');
```

### Run Import Test

```bash
# Via artisan tinker
$file = new Illuminate\Http\UploadedFile(
    'path/to/test.xlsx',
    'test.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    null,
    true
);
$result = (new ImportStudentsFromCsv)->handle($file, $sectionId, $adminUser);
// Expected: ['success' => 1, 'failed' => 0, 'errors' => []]
```

---

## 8. Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| 500 error on XLSX upload | Missing ZipArchive extension | Enable `php_zip.dll` in php.ini |
| "XLSX not supported" message | PhpSpreadsheet not autoloaded | Add to composer.json autoload.files |
| Import creates 0 students | Headers don't match expected columns | Check column names match exactly |
| LRN validation fails | LRN has non-digits or wrong length | Clean LRN with `preg_replace('/\D/', '', $lrn)` |
| "File not readable" | File in temp location, expired | Use multiple fallback read methods |
| Teacher can't import | Teacher not assigned to section | Assign teacher to section first |

---

## 9. Security Considerations

1. **File type validation** — `mimes` rule checks actual file content, not just extension
2. **File size limit** — 10MB max prevents memory exhaustion
3. **Rate limiting** — `throttle:10,1` prevents abuse (10 requests per minute)
4. **Authorization** — Only admin/super_admin can import (via policy)
5. **Section access** — Teachers can only import to assigned sections
6. **Unique LRN check** — Prevents duplicate student records
7. **Input sanitization** — All string inputs trimmed, LRN cleaned of non-digits

---

## 10. Quick Reference

### Supported File Types by Role

| Role | CSV | TXT | XLSX | XLS |
|------|-----|-----|------|-----|
| super_admin | ✅ | ✅ | ✅* | ✅* |
| admin | ✅ | ✅ | ✅* | ✅* |
| teacher | ❌ | ❌ | ❌ | ❌ |
| student | ❌ | ❌ | ❌ | ❌ |
| security_guard | ❌ | ❌ | ❌ | ❌ |

*Requires ZipArchive + PhpSpreadsheet on server

### Column Mapping

| CSV Header | Database Column | Required |
|------------|-----------------|----------|
| `first_name` | `first_name` | ✅ |
| `last_name` | `last_name` | ✅ |
| `lrn` | `lrn` | ✅ |
| `middle_name` | `middle_name` | ❌ |
| `guardian_name` | `guardian_name` | ❌ |
| `guardian_email` | `guardian_email` | ❌ |
| `section_id` | `section_id` | ❌ (use form select) |

