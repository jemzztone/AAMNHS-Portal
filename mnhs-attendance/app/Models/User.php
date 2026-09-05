<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'is_active',
        'force_password_change',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'force_password_change' => 'boolean',
        ];
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function teacherAssignments()
    {
        return $this->hasMany(TeacherSectionAssignment::class);
    }

    public function assignedSections()
    {
        return $this->belongsToMany(Section::class, 'teacher_section_assignments', 'user_id', 'section_id');
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isSecurityGuard(): bool
    {
        return $this->role === 'security_guard';
    }

    public function canManageStudents(): bool
    {
        return in_array($this->role, ['super_admin', 'admin', 'teacher']);
    }

    public function canManageTeachers(): bool
    {
        return in_array($this->role, ['super_admin', 'admin']);
    }

    public function canViewAnalytics(): bool
    {
        return in_array($this->role, ['super_admin', 'admin', 'teacher']);
    }

    public function canApproveAdmissionSlips(): bool
    {
        return in_array($this->role, ['super_admin', 'admin', 'teacher']);
    }
}
