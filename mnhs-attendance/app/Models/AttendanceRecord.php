<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class AttendanceRecord extends Model
{
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'student_id',
        'date',
        'status',
        'time_in',
        'time_out',
        'source',
        'recorded_by',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'metadata' => 'array',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function guardianNotifications()
    {
        return $this->hasMany(GuardianNotification::class);
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeForSection($query, $sectionId)
    {
        // Section is derived from the student (3NF): attendance -> student -> section.
        return $query->whereHas('student', fn ($q) => $q->where('section_id', $sectionId));
    }
}
