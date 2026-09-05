<?php

namespace App\Actions\Attendance\Exceptions;

use App\Models\AttendanceRecord;
use App\Models\Student;
use RuntimeException;

class QrScanDeniedException extends RuntimeException
{
    /**
     * @param  string  $reason  machine-readable denial reason ('invalid_qr', 'inactive', 'already_scanned', 'admission_slip_required')
     */
    public function __construct(
        public readonly string $reason,
        string $message,
        public readonly ?Student $student = null,
        public readonly ?AttendanceRecord $existingRecord = null,
    ) {
        parent::__construct($message);
    }
}
