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

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $user = $this->user();

        // Teachers and Admins can import XLSX, others only CSV
        $isAdminOrTeacher = in_array($user->role, ['admin', 'teacher']);

        // Only accept XLSX if ZipArchive is available on the server
        $xlsxSupported = class_exists('ZipArchive');

        $allowedMimes = 'csv,txt';
        if ($isAdminOrTeacher && $xlsxSupported) {
            $allowedMimes .= ',xlsx,xls';
        }

        return [
            'csv_file' => [
                'required',
                'file',
                "mimes:{$allowedMimes}",
                'max:10240',
            ],
            'section_id' => 'nullable|exists:sections,id',
        ];
    }

    public function messages(): array
    {
        $user = $this->user();
        $isAdminOrTeacher = in_array($user->role, ['admin', 'teacher']);
        $xlsxSupported = class_exists('ZipArchive');

        $mimeMessage = 'The file must be a valid CSV or TXT file.';
        if ($isAdminOrTeacher && $xlsxSupported) {
            $mimeMessage = 'The file must be a valid CSV, TXT, XLSX, or XLS file.';
        } elseif ($isAdminOrTeacher && ! $xlsxSupported) {
            $mimeMessage = 'XLSX files are not supported on this server. Please use CSV or TXT files.';
        }

        return [
            'csv_file.required' => 'Please select a file to import.',
            'csv_file.mimes' => $mimeMessage,
            'csv_file.max' => 'The file size must not exceed 10MB.',
        ];
    }
}
