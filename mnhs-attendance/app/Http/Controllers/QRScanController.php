<?php

namespace App\Http\Controllers;

use App\Actions\Attendance\Exceptions\QrScanDeniedException;
use App\Actions\Attendance\ProcessQrScan;
use App\Http\Requests\ScanStudentQrRequest;
use Inertia\Inertia;

class QRScanController extends Controller
{
    public function index()
    {
        return Inertia::render('Guard/Scan');
    }

    public function scan(ScanStudentQrRequest $request)
    {
        try {
            $record = (new ProcessQrScan)->handle(
                $request->validated('qr_token'),
                $request->ip(),
                $request->userAgent(),
            );
        } catch (QrScanDeniedException $e) {
            return $this->deniedResponse($e);
        }

        return response()->json([
            'success' => true,
            'message' => "Student {$record->status}. Time in recorded at {$record->time_in}.",
            'student' => $record->student->load('section'),
            'record' => $record,
        ]);
    }

    private function deniedResponse(QrScanDeniedException $e)
    {
        $status = match ($e->reason) {
            'invalid_qr' => 404,
            'inactive', 'admission_slip_required' => 403,
            'already_scanned' => 409,
            default => 403,
        };

        $payload = [
            'success' => false,
            'message' => $e->getMessage(),
        ];

        if ($e->student) {
            $payload['student'] = $e->student;
        }

        if ($e->reason === 'admission_slip_required') {
            $payload['requires_admission_slip'] = true;
        }

        if ($e->existingRecord) {
            $payload['existing_record'] = $e->existingRecord;
        }

        return response()->json($payload, $status);
    }
}
