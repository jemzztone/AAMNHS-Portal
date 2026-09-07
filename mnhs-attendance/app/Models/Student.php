<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Student extends Model
{
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'lrn',
        'first_name',
        'last_name',
        'middle_name',
        'section_id',
        'photo_path',
        'guardian_name',
        'guardian_email',
        'qr_token',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
            if (empty($model->qr_token)) {
                $model->qr_token = (string) Str::uuid();
            }
        });

        // Keep Student.is_active in sync with the linked User.is_active.
        // The DB trigger (migration 2026_09_06_110000) is the authoritative
        // guarantee for both directions; this hook covers the ORM path
        // student → user as defense-in-depth.
        static::updating(function (Student $student) {
            if ($student->isDirty('is_active') && $student->user_id) {
                User::where('id', $student->user_id)
                    ->update(['is_active' => $student->is_active]);
            }
        });
    }

    protected $appends = ['full_name', 'photo_url'];

    public function getFullNameAttribute(): string
    {
        $parts = array_filter([$this->first_name, $this->middle_name, $this->last_name]);

        return implode(' ', $parts);
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (! $this->photo_path) {
            return null;
        }

        return route('students.photo', ['filename' => basename($this->photo_path)]);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function admissionSlips()
    {
        return $this->hasMany(AdmissionSlip::class);
    }

    public function guardianNotifications()
    {
        return $this->hasMany(GuardianNotification::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeBySection($query, $sectionId)
    {
        return $query->where('section_id', $sectionId);
    }
}
